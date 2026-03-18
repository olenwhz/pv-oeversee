from models import AllParams
from calculator import calc_full_hm


def reset_to_defaults() -> AllParams:
    return AllParams()


def optimize_zyklen(params: AllParams) -> AllParams:
    best_npv_hm5 = -1e12
    best_zyklen_hm5 = 1.23
    test_params = params.model_copy(deep=True)
    j = 0.0
    while j <= 4.5:
        test_params.hm5.zyklen_11_20 = round(j, 3)
        result = calc_full_hm('hm5', test_params)
        dscr_ok = result['kpis']['dscr_ok']
        npv = result['kpis']['npv_30']
        if dscr_ok and npv > best_npv_hm5:
            best_npv_hm5 = npv
            best_zyklen_hm5 = j
        j = round(j + 0.01, 3)

    best_npv_hm6 = -1e12
    best_zyklen_hm6 = 1.23
    test_params2 = params.model_copy(deep=True)
    j = 0.0
    while j <= 4.5:
        test_params2.hm6.zyklen_11_20 = round(j, 3)
        result = calc_full_hm('hm6', test_params2)
        dscr_ok = result['kpis']['dscr_ok']
        npv = result['kpis']['npv_30']
        if dscr_ok and npv > best_npv_hm6:
            best_npv_hm6 = npv
            best_zyklen_hm6 = j
        j = round(j + 0.01, 3)

    optimized = params.model_copy(deep=True)
    optimized.hm5.zyklen_11_20 = best_zyklen_hm5
    optimized.hm6.zyklen_11_20 = best_zyklen_hm6
    return optimized


def optimize_fixverguetung(params: AllParams) -> AllParams:
    STEPS = [0.01, 0.001, 0.0001, 0.00001, 0.000001, 0.0000001, 0.00000001]

    def optimize_single_param(p, hm_key, param_name, current_val):
        test = p.model_copy(deep=True)
        val = current_val
        for step in STEPS:
            while True:
                val_test = round(val + step, 10)
                if val_test <= 0:
                    break
                setattr(getattr(test, hm_key), param_name, val_test)
                result = calc_full_hm(hm_key, test)
                if result['kpis']['dscr_ok']:
                    val = val_test
                    setattr(getattr(test, hm_key), param_name, val)
                else:
                    break
        return val

    optimized = params.model_copy(deep=True)

    opt_val = optimize_single_param(optimized, 'hm1', 'dv_bonus_11_20', optimized.hm1.dv_bonus_11_20)
    optimized.hm1.dv_bonus_11_20 = round(opt_val, 8)

    opt_val = optimize_single_param(optimized, 'hm3', 'fix_verguetung_pv_11_20', optimized.hm3.fix_verguetung_pv_11_20)
    optimized.hm3.fix_verguetung_pv_11_20 = round(opt_val, 8)

    opt_val = optimize_single_param(optimized, 'hm6', 'fix_verguetung_pv_11_20', optimized.hm6.fix_verguetung_pv_11_20)
    optimized.hm6.fix_verguetung_pv_11_20 = round(opt_val, 8)

    return optimized
