from models import AllParams, GeneralParams, PSParams

MONTHLY_BASE_KWH = [
    223729.89,   # Januar
    376256.34,   # Februar
    739072.99,   # März
    1093639.51,  # April
    1197003.51,  # Mai
    1175717.64,  # Juni
    1130951.92,  # Juli
    1019421.76,  # August
    812315.88,   # September
    543964.38,   # Oktober
    266512.36,   # November
    154115.33    # Dezember
]

SEASONAL_MULT = [
    1.024365392,   # Januar
    1.043321655,   # Februar
    0.968716752,   # März
    0.884811018,   # April
    0.901377490,   # Mai
    0.966276564,   # Juni
    0.987173774,   # Juli
    1.001946733,   # August
    1.065012471,   # September
    1.103649816,   # Oktober
    1.053354121,   # November
    0.999994214    # Dezember
]

CAPEX = 8_996_274.40
DARLEHEN = 7_600_000.0
EIGENKAPITAL = CAPEX - DARLEHEN
TILGUNG_PA = 400_000.0
AFA_PA = 416_166.144
EEG_GUARANTEED = 0.0878
GEWERBESTEUER = 0.035 * 3.8
DV_KOSTEN_1_10_BASE = 39_615.0
SPEICHER_ERSATZ_KOSTEN = 2_926_080.0
DAYS_PER_MONTH = 365 / 12
PER_CYCLE_DEGRAD = 0.00003387

OPEX_BASE = {
    "betrieb":      84_000.0,
    "verwaltung":   10_000.0,
    "gruenpflege":  5_392.73,
    "eigenstrom":   8_987.88,
    "versicherung": 8_987.88,
    "pacht":        41_170.0
}


def calc_production(params: GeneralParams) -> list:
    result = []
    for year in range(1, 31):
        # Degradation ist jahresweise: alle Monate eines Jahres haben denselben Faktor.
        # t = Anzahl bereits vergangener Monate am Jahresbeginn (year 1 → t=0, factor=1)
        t = (year - 1) * 12
        monthly = []
        for m in range(12):
            val = MONTHLY_BASE_KWH[m] * (1 - params.degradationsfaktor) ** t
            monthly.append(val)
        result.append({
            "year": year,
            "monthly_kwh": monthly,
            "annual_kwh": sum(monthly)
        })
    return result


def calc_spot_prices(params: GeneralParams) -> list:
    result = []
    for year in range(1, 31):
        monthly = []
        for m in range(12):
            t = (year - 1) * 12 + m
            spot = params.achsenabschnitt * (1 + params.preisinflation / 12) ** t * SEASONAL_MULT[m]
            monthly.append(spot)
        result.append({
            "year": year,
            "monthly_spot": monthly,
            "avg_spot": sum(monthly) / 12,
            "monthly_upper": [s * (1 + params.upper_spread) for s in monthly],
            "monthly_lower": [s * (1 - params.lower_spread) for s in monthly],
        })
    return result


def calc_battery(params: GeneralParams, hm_key: str, hm_params: dict, hme_params: dict) -> dict:
    start_cap = 8000.0 if hm_key in ('hm1', 'hm2', 'hm3') else 8128.0
    cap = start_cap
    monthly_caps = []
    ersatz_jahr = None
    ersatz_kosten = 0.0

    def get_zyklen(year):
        if hm_key in ('hm1', 'hm2', 'hm3'):
            return 1.23
        elif hm_key == 'hm4':
            if year <= 10:
                return 1.23
            elif year <= 20:
                return hm_params.get('zyklen_11_20', 4.5)
            else:
                return hme_params.get('zyklen', 1.23)
        elif hm_key == 'hm5':
            if year <= 10:
                return 1.23
            elif year <= 20:
                return hm_params.get('zyklen_11_20', 1.23)
            else:
                return hme_params.get('zyklen', 1.23)
        elif hm_key == 'hm6':
            if year <= 10:
                return 1.23
            elif year <= 20:
                return hm_params.get('zyklen_11_20', 4.5)
            else:
                return hme_params.get('zyklen', 1.23)
        return 1.23

    for year in range(1, 31):
        zyklen = get_zyklen(year)
        year_caps = []
        for m in range(12):
            year_caps.append(cap)
            cap = cap * (1 - PER_CYCLE_DEGRAD * zyklen) ** DAYS_PER_MONTH

            if hm_key == 'hm5' and cap < hm_params.get('untergrenze_kapazitaet', 5970.31) and ersatz_jahr is None:
                ersatz_jahr = year
                ersatz_kosten = SPEICHER_ERSATZ_KOSTEN
                cap = 8128.0

        monthly_caps.append(year_caps)

    return {
        "monthly_caps": monthly_caps,
        "ersatz_jahr": ersatz_jahr,
        "ersatz_kosten": ersatz_kosten
    }


def calc_erloes(
    year: int, hm_key: str,
    prod_monthly: list, spot_monthly: list,
    bat_monthly_caps: list,
    params: GeneralParams, ps: PSParams,
    hm_p: dict, hme_p: dict,
    zyklen_day: float
) -> float:
    phase = '1-10' if year <= 10 else '11-20' if year <= 20 else '21-30'

    if phase == '1-10':
        dv_bonus = hm_p.get('dv_bonus_1_10', 0.023)
        return sum(prod_monthly) * (EEG_GUARANTEED + dv_bonus)

    if phase == '11-20':
        if hm_key == 'hm1':
            return sum(prod_monthly) * (EEG_GUARANTEED + hm_p['dv_bonus_11_20'])
        elif hm_key == 'hm2':
            return sum(prod_monthly) * EEG_GUARANTEED
        elif hm_key == 'hm3':
            total = 0
            for m in range(12):
                cap = bat_monthly_caps[m]
                bat_s = min(prod_monthly[m], cap * zyklen_day * DAYS_PER_MONTH)
                rest = prod_monthly[m] - bat_s
                wb = spot_monthly[m] * (ps.upper_bat * (1 + params.upper_spread) + ps.middle_bat + ps.lower_bat * (1 - params.lower_spread))
                total += bat_s * wb * params.profit_share
                total += rest * hm_p['fix_verguetung_pv_11_20']
            return total
        elif hm_key == 'hm4':
            total = 0
            for m in range(12):
                cap = bat_monthly_caps[m]
                bat_s = min(prod_monthly[m], cap * zyklen_day * DAYS_PER_MONTH)
                rest = prod_monthly[m] - bat_s
                sp = spot_monthly[m]
                eeg_comp = prod_monthly[m] * max(0, EEG_GUARANTEED - sp)
                wb = sp * (ps.upper_bat * (1 + params.upper_spread) + ps.middle_bat + ps.lower_bat * (1 - params.lower_spread))
                wp = sp * (ps.upper_pv * (1 + params.upper_spread) + ps.middle_pv + ps.lower_pv * (1 - params.lower_spread))
                total += eeg_comp + bat_s * wb * params.profit_share + rest * wp * params.profit_share
            return total
        elif hm_key == 'hm5':
            total = 0
            for m in range(12):
                cap = bat_monthly_caps[m]
                bat_s = min(prod_monthly[m], cap * zyklen_day * DAYS_PER_MONTH)
                rest = prod_monthly[m] - bat_s
                sp = spot_monthly[m]
                eeg_comp = prod_monthly[m] * max(0, EEG_GUARANTEED - sp)
                wb = sp * (ps.upper_bat * (1 + params.upper_spread) + ps.middle_bat + ps.lower_bat * (1 - params.lower_spread))
                wp = sp * (ps.upper_pv * (1 + params.upper_spread) + ps.middle_pv + ps.lower_pv * (1 - params.lower_spread))
                total += eeg_comp + bat_s * wb * params.profit_share + rest * wp * params.profit_share
            return total
        elif hm_key == 'hm6':
            total = 0
            for m in range(12):
                cap = bat_monthly_caps[m]
                bat_s = min(prod_monthly[m], cap * zyklen_day * DAYS_PER_MONTH)
                rest = prod_monthly[m] - bat_s
                wb = spot_monthly[m] * (ps.upper_bat * (1 + params.upper_spread) + ps.middle_bat + ps.lower_bat * (1 - params.lower_spread))
                total += bat_s * wb * params.profit_share
                total += rest * hm_p['fix_verguetung_pv_11_20']
            return total

    if phase == '21-30':
        hme_key = {'hm1': 'hme1', 'hm2': 'hme1', 'hm3': 'hme2', 'hm4': 'hme3', 'hm5': 'hme2', 'hm6': 'hme3'}[hm_key]
        if hme_key == 'hme1':
            return sum(prod_monthly) * hme_p['dv_bonus']
        elif hme_key == 'hme2':
            total = 0
            for m in range(12):
                cap = bat_monthly_caps[m]
                bat_s = min(prod_monthly[m], cap * zyklen_day * DAYS_PER_MONTH)
                rest = prod_monthly[m] - bat_s
                wb = spot_monthly[m] * (ps.upper_bat * (1 + params.upper_spread) + ps.middle_bat + ps.lower_bat * (1 - params.lower_spread))
                total += bat_s * wb * params.profit_share
                total += rest * hme_p['fix_verguetung_pv']
            return total
        elif hme_key == 'hme3':
            total = 0
            for m in range(12):
                cap = bat_monthly_caps[m]
                bat_s = min(prod_monthly[m], cap * zyklen_day * DAYS_PER_MONTH)
                rest = prod_monthly[m] - bat_s
                sp = spot_monthly[m]
                wb = sp * (ps.upper_bat * (1 + params.upper_spread) + ps.middle_bat + ps.lower_bat * (1 - params.lower_spread))
                wp = sp * (ps.upper_pv * (1 + params.upper_spread) + ps.middle_pv + ps.lower_pv * (1 - params.lower_spread))
                total += bat_s * wb * params.profit_share + rest * wp * params.profit_share
            return total

    return 0.0


def calc_opex(year: int, params: GeneralParams, dv_kosten_year: float, ersatz_inv: float = 0) -> float:
    infl = (1 + params.opex_inflation) ** (year - 1)
    opex = (
        OPEX_BASE["betrieb"] * infl +
        OPEX_BASE["verwaltung"] * infl +
        OPEX_BASE["gruenpflege"] * infl +
        OPEX_BASE["eigenstrom"] * infl +
        OPEX_BASE["versicherung"] * infl +
        OPEX_BASE["pacht"] +
        dv_kosten_year +
        ersatz_inv
    )
    return opex


def calc_dv_kosten(year: int, hm_key: str, hm_p: dict, hme_p: dict) -> float:
    if year <= 10:
        return DV_KOSTEN_1_10_BASE * 1.02 ** (year - 1)
    elif year <= 20:
        base = hm_p.get('dv_kosten_11_20', 0)
        return base * 1.02 ** (year - 11)
    else:
        base = hme_p.get('dv_kosten', 0)
        return base * 1.02 ** (year - 21)


def calc_debt(year: int, params: GeneralParams) -> dict:
    # Jahr 1 hat keine Tilgung → Restschuld zu Beginn Jahr 2 noch = DARLEHEN
    # Tilgung startet ab Jahr 2 → Offset: max(0, year - 2) bisherige Tilgungen
    restschuld_anfang = max(0, DARLEHEN - max(0, year - 2) * TILGUNG_PA)
    zinssatz = params.zinssatz_1_10 if year <= 10 else (params.zinssatz_11_20 if year <= 20 else 0)
    zinsen = restschuld_anfang * zinssatz
    tilgung = 0 if year == 1 else min(TILGUNG_PA, restschuld_anfang)
    restschuld_ende = restschuld_anfang - tilgung
    return {
        "zinsen": zinsen,
        "tilgung": tilgung,
        "restschuld_anfang": restschuld_anfang,
        "restschuld_ende": restschuld_ende,
        "kapitaldienst": zinsen + tilgung
    }


def calc_year_financials(erloes, opex, afa, zinsen, tilgung) -> dict:
    ebit = erloes - opex - afa
    ebt = ebit - zinsen
    gewst = max(0, ebt) * GEWERBESTEUER
    eat = ebt - gewst
    cf_steuern = eat + afa
    cf_tilgung = cf_steuern - tilgung
    cfads = cf_steuern
    return {
        "erloes": erloes, "opex": opex, "afa": afa,
        "ebit": ebit, "zinsen": zinsen, "ebt": ebt,
        "gewst": gewst, "eat": eat,
        "cf_steuern": cf_steuern, "tilgung": tilgung,
        "cf_tilgung": cf_tilgung, "cfads": cfads
    }


def calc_kpis(years_data: list, params: GeneralParams) -> dict:
    cf0 = -(EIGENKAPITAL + params.kosten_zinscap)

    def npv_at_rate(rate, n_years):
        s = cf0
        for i in range(n_years):
            s += years_data[i]["cf_tilgung"] / (1 + rate) ** (i + 1)
        return s

    npv_20 = npv_at_rate(params.kalkulationszins, 20)
    npv_30 = npv_at_rate(params.kalkulationszins, 30)

    npv_series = [cf0]
    running = cf0
    for i, y in enumerate(years_data):
        running += y["cf_tilgung"] / (1 + params.kalkulationszins) ** (i + 1)
        npv_series.append(running)

    irr = None
    try:
        lo, hi = -0.5, 2.0
        if npv_at_rate(lo, 30) * npv_at_rate(hi, 30) < 0:
            for _ in range(60):
                mid = (lo + hi) / 2
                if npv_at_rate(lo, 30) * npv_at_rate(mid, 30) < 0:
                    hi = mid
                else:
                    lo = mid
            irr = (lo + hi) / 2
    except Exception:
        pass

    eff_20 = sum(y["cf_tilgung"] for y in years_data[:20]) + cf0
    eff_30 = sum(y["cf_tilgung"] for y in years_data) + cf0

    def dyn_amort(n):
        cum = cf0
        for i in range(n):
            cum += years_data[i]["cf_tilgung"] / (1 + params.kalkulationszins) ** (i + 1)
            if cum >= 0:
                return i + 1
        return None

    def stat_amort(n):
        cum = 0
        threshold = EIGENKAPITAL + params.kosten_zinscap
        for i in range(n):
            cum += years_data[i]["cf_tilgung"]
            if cum >= threshold:
                return i + 1
        return None

    dscr_year = []
    for y in years_data[:20]:
        kd = y["zinsen"] + y["tilgung"]
        # DSCR = (CF nach Steuern + Zinsen) / (Zinsen + Tilgung)
        # = EBITDA nach Steuern / Kapitaldienst
        dscr = (y["cf_steuern"] + y["zinsen"]) / kd if kd > 0 else None
        dscr_year.append(dscr)

    dscr_min_val = min(d for d in dscr_year if d is not None) if any(d is not None for d in dscr_year) else None
    dscr_ok = dscr_min_val is not None and dscr_min_val >= params.dscr_min

    sum_cfads = sum(
        years_data[i]["cf_steuern"] / (1 + (params.zinssatz_1_10 if i < 10 else params.zinssatz_11_20)) ** (i + 1)
        for i in range(20)
    )
    llcr = sum_cfads / DARLEHEN if DARLEHEN > 0 else None

    roi_20 = sum(y["eat"] for y in years_data[:20]) / CAPEX
    roi_30 = sum(y["eat"] for y in years_data) / CAPEX

    wacc = (EIGENKAPITAL / CAPEX) * params.ek_zins + (DARLEHEN / CAPEX) * params.zinssatz_1_10 * (1 - GEWERBESTEUER)

    gk_rent_initial = years_data[0]["ebit"] / CAPEX
    gk_rent_avg = sum(y["ebt"] for y in years_data[:20]) / 20 / CAPEX

    ek_rent_initial = years_data[0]["ebt"] / EIGENKAPITAL
    ek_rent_avg = sum(y["ebt"] for y in years_data[:20]) / 20 / EIGENKAPITAL

    crf = params.kalkulationszins * (1 + params.kalkulationszins) ** 20 / ((1 + params.kalkulationszins) ** 20 - 1)
    avg_opex = sum(y["opex"] for y in years_data[:20]) / 20
    avg_prod = sum(y.get("production", 0) for y in years_data[:20]) / 20
    lcoe = (CAPEX * crf + avg_opex) / avg_prod if avg_prod > 0 else None

    return {
        "npv_20": npv_20, "npv_30": npv_30, "npv_series": npv_series,
        "irr": irr,
        "eff_20": eff_20, "eff_30": eff_30,
        "amort_dyn_20": dyn_amort(20), "amort_dyn_30": dyn_amort(30),
        "amort_stat_20": stat_amort(20), "amort_stat_30": stat_amort(30),
        "dscr_values": dscr_year, "dscr_min": dscr_min_val, "dscr_ok": dscr_ok,
        "llcr": llcr, "roi_20": roi_20, "roi_30": roi_30, "wacc": wacc,
        "gk_rent_initial": gk_rent_initial, "gk_rent_avg": gk_rent_avg,
        "ek_rent_initial": ek_rent_initial, "ek_rent_avg": ek_rent_avg,
        "lcoe": lcoe
    }


def calc_full_hm(hm_key: str, params: AllParams) -> dict:
    general = params.general
    ps = params.ps

    hm_map = {
        'hm1': params.hm1,
        'hm2': params.hm2,
        'hm3': params.hm3,
        'hm4': params.hm4,
        'hm5': params.hm5,
        'hm6': params.hm6,
    }
    hme_map = {
        'hm1': params.hme1,
        'hm2': params.hme1,
        'hm3': params.hme2,
        'hm4': params.hme3,
        'hm5': params.hme2,
        'hm6': params.hme3,
    }

    hm_obj = hm_map[hm_key]
    hme_obj = hme_map[hm_key]
    hm_p = hm_obj.dict()
    hme_p = hme_obj.dict()

    production = calc_production(general)
    prices = calc_spot_prices(general)
    battery = calc_battery(general, hm_key, hm_p, hme_p)

    years_data = []
    for year in range(1, 31):
        yi = year - 1
        prod_monthly = production[yi]["monthly_kwh"]
        spot_monthly = prices[yi]["monthly_spot"]
        bat_caps = battery["monthly_caps"][yi]

        def get_zyklen_day(yr):
            if hm_key in ('hm1', 'hm2', 'hm3'):
                return 1.23
            elif hm_key == 'hm4':
                if yr <= 10:
                    return 1.23
                elif yr <= 20:
                    return hm_p.get('zyklen_11_20', 4.5)
                else:
                    return hme_p.get('zyklen', 1.23)
            elif hm_key == 'hm5':
                if yr <= 10:
                    return 1.23
                elif yr <= 20:
                    return hm_p.get('zyklen_11_20', 1.23)
                else:
                    return hme_p.get('zyklen', 1.23)
            elif hm_key == 'hm6':
                if yr <= 10:
                    return 1.23
                elif yr <= 20:
                    return hm_p.get('zyklen_11_20', 4.5)
                else:
                    return hme_p.get('zyklen', 1.23)
            return 1.23

        zyklen_day = get_zyklen_day(year)

        erloes = calc_erloes(
            year, hm_key,
            prod_monthly, spot_monthly, bat_caps,
            general, ps, hm_p, hme_p, zyklen_day
        )

        ersatz_inv = battery["ersatz_kosten"] if battery["ersatz_jahr"] == year else 0.0

        dv_kosten = calc_dv_kosten(year, hm_key, hm_p, hme_p)
        opex = calc_opex(year, general, dv_kosten, ersatz_inv)

        afa = AFA_PA if year <= 20 else 0.0
        debt = calc_debt(year, general)

        ydata = calc_year_financials(erloes, opex, afa, debt["zinsen"], debt["tilgung"])
        ydata["year"] = year
        ydata["production"] = production[yi]["annual_kwh"]
        ydata["restschuld_anfang"] = debt["restschuld_anfang"]
        ydata["restschuld_ende"] = debt["restschuld_ende"]
        ydata["kapitaldienst"] = debt["kapitaldienst"]
        years_data.append(ydata)

    kpis = calc_kpis(years_data, general)

    return {
        "years": years_data,
        "kpis": kpis,
        "battery": {
            "monthly_caps": battery["monthly_caps"],
            "ersatz_jahr": battery["ersatz_jahr"],
            "ersatz_kosten": battery["ersatz_kosten"]
        },
        "production": [p["annual_kwh"] for p in production],
        "monthly_production": [p["monthly_kwh"] for p in production],
        "prices": [p["avg_spot"] for p in prices],
        "monthly_prices": [p["monthly_spot"] for p in prices],
    }
