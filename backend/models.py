from pydantic import BaseModel
from typing import Optional


class GeneralParams(BaseModel):
    achsenabschnitt: float = 0.056
    preisinflation: float = 0.02
    s_amplitude: float = 0.8
    phi: float = 0.0
    upper_spread: float = 0.60
    lower_spread: float = 0.25
    kalkulationszins: float = 0.08
    ek_zins: float = 0.146
    zinssatz_1_10: float = 0.039
    zinssatz_11_20: float = 0.046
    kosten_zinscap: float = 49_500.0
    opex_inflation: float = 0.02
    degradationsfaktor: float = 0.000166859755278
    profit_share: float = 0.90
    dscr_min: float = 1.0876790873350235
    max_zyklen: float = 4.5


class PSParams(BaseModel):
    upper_bat: float = 0.608334178241914
    middle_bat: float = 0.391665821758086
    lower_bat: float = 0.0
    upper_pv: float = 0.279166666666667
    middle_pv: float = 0.288333333333333
    lower_pv: float = 0.295


class HM1Params(BaseModel):
    dv_bonus_1_10: float = 0.023
    dv_bonus_11_20: float = 0.013819723
    dv_kosten_11_20: float = 45_000.0


class HM2Params(BaseModel):
    dv_bonus_1_10: float = 0.023
    dv_kosten_11_20: float = 45_000.0


class HM3Params(BaseModel):
    dv_bonus_1_10: float = 0.023
    fix_verguetung_pv_11_20: float = 0.11137795299999995
    dv_kosten_11_20: float = 45_000.0


class HM4Params(BaseModel):
    dv_bonus_1_10: float = 0.023
    dv_kosten_11_20: float = 0.0


class HM5Params(BaseModel):
    dv_bonus_1_10: float = 0.023
    untergrenze_kapazitaet: float = 5970.31
    zyklen_11_20: float = 1.23
    dv_kosten_11_20: float = 0.0


class HM6Params(BaseModel):
    dv_bonus_1_10: float = 0.023
    zyklen_11_20: float = 4.5
    fix_verguetung_pv_11_20: float = 0.27707729
    dv_kosten_11_20: float = 45_000.0
    untergrenze_kapazitaet: float = 5970.31


class HME1Params(BaseModel):
    dv_bonus: float = 0.07
    dv_kosten: float = 50_000.0
    zyklen: float = 1.23


class HME2Params(BaseModel):
    fix_verguetung_pv: float = 0.04
    dv_kosten: float = 50_000.0
    zyklen: float = 1.23


class HME3Params(BaseModel):
    dv_kosten: float = 0.0
    zyklen: float = 1.23


class AllParams(BaseModel):
    general: GeneralParams = GeneralParams()
    ps: PSParams = PSParams()
    hm1: HM1Params = HM1Params()
    hm2: HM2Params = HM2Params()
    hm3: HM3Params = HM3Params()
    hm4: HM4Params = HM4Params()
    hm5: HM5Params = HM5Params()
    hm6: HM6Params = HM6Params()
    hme1: HME1Params = HME1Params()
    hme2: HME2Params = HME2Params()
    hme3: HME3Params = HME3Params()
