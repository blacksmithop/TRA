from pydantic import BaseModel
from typing import List, Optional, Union, Dict

from common_models import RequestMetadataWithLinks  # Assuming common_models is in the same package

# Placeholders for referenced enums/IDs (not defined in truncated spec, assumed types)
HonorId = int
HonorTypeEnum = str
HonorRarityEnum = str
MedalId = int
MedalTypeEnum = str
OrganizedCrimeName = str
TornOrganizedCrimePositionId = int
ItemId = int
EducationId = int
TornCrimeId = int
UserRankEnum = str
LogId = int
LogCategoryId = int
AmmoId = int
TornItemAmmoTypeEnum = str
ItemModId = int
TornItemWeaponTypeEnum = str
TornItemWeaponCategoryEnum = str
TornItemTypeEnum = str
TornItemArmorCoveragePartEnum = str
AttackActionEnum = str

class TornMerit(BaseModel):
    # No specific properties in spec, assuming array in response
    pass  # Adjust if more details available

class TornMeritsResponse(BaseModel):
    merits: List[TornMerit]

class TornHonorType(BaseModel):
    id: int
    title: str

class TornHonor(BaseModel):
    id: int
    name: str
    description: str
    type: TornHonorType
    circulation: Optional[int] = None
    equipped: Optional[int] = None
    rarity: Optional[str] = None

class TornHonorsResponse(BaseModel):
    honors: List[TornHonor]

class TornMedalType(BaseModel):
    id: str
    title: str

class TornMedal(BaseModel):
    id: int
    name: str
    description: str
    type: TornMedalType
    circulation: int
    rarity: str  # HonorRarityEnum

class TornMedalsResponse(BaseModel):
    medals: List[TornMedal]

class TornOrganizedCrimeSpawn(BaseModel):
    level: int
    name: str

class TornOrganizedCrimeScope(BaseModel):
    cost: int
    return_: int  # 'return' is reserved, using return_

class TornOrganizedCrimeSlot(BaseModel):
    id: int
    name: str
    required_item: Optional[Dict] = None  # TornOrganizedCrimeRequiredItem or None

class TornOrganizedCrimeRequiredItem(BaseModel):
    id: int
    name: str
    is_used: bool

class TornOrganizedCrime(BaseModel):
    name: str
    description: str
    difficulty: int
    spawn: TornOrganizedCrimeSpawn
    scope: TornOrganizedCrimeScope
    prerequisite: Optional[str] = None
    slots: List[TornOrganizedCrimeSlot]

class TornOrganizedCrimeResponse(BaseModel):
    organizedcrimes: List[TornOrganizedCrime]

class TornEducationRewards(BaseModel):
    working_stats: Dict[str, Optional[int]]  # manual_labor, intelligence, endurance
    effect: Optional[str] = None
    honor: Optional[str] = None

class TornEducationPrerequisites(BaseModel):
    cost: int
    courses: List[int]

class TornEducationCourses(BaseModel):
    id: int
    code: str
    name: str
    description: str
    duration: int
    rewards: TornEducationRewards
    prerequisites: TornEducationPrerequisites

class TornEducation(BaseModel):
    id: int
    name: str
    courses: List[TornEducationCourses]

class TornEducationResponse(BaseModel):
    education: List[TornEducation]

class TornTerritoryCoordinates(BaseModel):
    x: float
    y: float

class TornTerritory(BaseModel):
    id: str  # FactionTerritoryEnum
    sector: int
    size: int
    density: int
    slots: int
    respect: int
    coordinates: TornTerritoryCoordinates
    neighbors: List[str]  # FactionTerritoryEnum

class TornTerritoriesResponse(BaseModel):
    territory: List[TornTerritory]
    _metadata: RequestMetadataWithLinks

class TornTerritoriesNoLinksResponse(BaseModel):
    territory: List[TornTerritory]

class TornSubcrime(BaseModel):
    id: int
    name: str
    nerve_cost: int

class TornSubcrimesResponse(BaseModel):
    subcrimes: List[TornSubcrime]

class TornCrime(BaseModel):
    id: int
    name: str
    category_id: int
    category_name: Optional[str] = None
    enhancer_id: int
    enhancer_name: str
    unique_outcomes_count: int
    unique_outcomes_ids: List[int]
    notes: List[str]

class TornCrimesResponse(BaseModel):
    crimes: List[TornCrime]

class TornCalendarActivity(BaseModel):
    title: str
    description: str
    start: int
    end: int

class Calendar(BaseModel):
    competitions: List[TornCalendarActivity]
    events: List[TornCalendarActivity]

class TornCalendarResponse(BaseModel):
    calendar: Calendar

class TornHofBasic(BaseModel):
    id: int
    username: str
    faction_id: int
    level: int
    last_action: int
    rank_name: str  # UserRankEnum
    rank_number: int
    position: int
    signed_up: int
    age_in_days: int
    value: Union[int, str, float]
    rank: str

class TornHofWithOffenses(TornHofBasic):
    criminal_offenses: int

TornHof = Union[TornHofBasic, TornHofWithOffenses]

class TornHofResponse(BaseModel):
    hof: List[TornHof]
    _metadata: RequestMetadataWithLinks

class TornFactionHof(BaseModel):
    id: int
    name: str
    members: int
    position: int
    rank: str
    values: FactionHofValues  # From faction_models

class TornFactionHofResponse(BaseModel):
    factionhof: List[TornFactionHof]
    _metadata: RequestMetadataWithLinks

class TornLog(BaseModel):
    id: int
    title: str

class TornLogCategory(BaseModel):
    id: int
    title: str

class TornLogTypesResponse(BaseModel):
    logtypes: List[TornLog]

class TornLogCategoriesResponse(BaseModel):
    logcategories: List[TornLogCategory]

class Bounty(BaseModel):
    target_id: int
    target_name: str
    target_level: int
    lister_id: Optional[int] = None
    lister_name: Optional[str] = None
    reward: int  # int64
    reason: Optional[str] = None
    quantity: int
    is_anonymous: bool
    valid_until: int

class AttackLogSummary(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    hits: int
    misses: int
    damage: int

class AttackItem(BaseModel):
    id: int
    name: str

class Attacker(BaseModel):
    id: int
    name: str
    item: Optional[AttackItem] = None

class Defender(BaseModel):
    id: int
    name: str

class AttackLog(BaseModel):
    text: str
    timestamp: int
    action: str  # AttackActionEnum
    icon: str
    attacker: Optional[Attacker] = None
    defender: Optional[Defender] = None
    attacker_item: Optional[AttackItem] = None

class AttackLogData(BaseModel):
    log: List[AttackLog]
    summary: List[AttackLogSummary]

class AttackLogResponse(BaseModel):
    attacklog: AttackLogData
    _metadata: RequestMetadataWithLinks

class TornBountiesResponse(BaseModel):
    bounties: List[Bounty]
    _metadata: RequestMetadataWithLinks

class TornItemAmmo(BaseModel):
    id: int
    name: str
    price: int  # int64
    types: List[str]  # TornItemAmmoTypeEnum

class TornItemAmmoResponse(BaseModel):
    itemammo: List[TornItemAmmo]

class TornItemMods(BaseModel):
    id: int
    name: str
    description: str
    dual_fit: bool
    weapons: List[str]  # TornItemWeaponTypeEnum

class TornItemModsResponse(BaseModel):
    itemmods: List[TornItemMods]

class TornItemBaseStats(BaseModel):
    damage: int
    accuracy: int
    armor: int

class RateOfFire(BaseModel):
    minimum: int
    maximum: int

class Ammo(BaseModel):
    id: int
    name: str
    magazine_rounds: int
    rate_of_fire: RateOfFire

class TornItemWeaponDetails(BaseModel):
    stealth_level: float
    base_stats: TornItemBaseStats
    category: str  # TornItemWeaponCategoryEnum
    ammo: Optional[Ammo] = None
    mods: List[int]  # ItemModId

class TornItemArmorCoverage(BaseModel):
    name: str  # TornItemArmorCoveragePartEnum
    value: float

class TornItemArmorDetails(BaseModel):
    coverage: List[TornItemArmorCoverage]
    base_stats: TornItemBaseStats

class Vendor(BaseModel):
    country: str
    name: str

class Value(BaseModel):
    vendor: Optional[Vendor] = None
    buy_price: Optional[int] = None  # int64
    sell_price: Optional[int] = None  # int64
    market_price: int  # int64

class TornItem(BaseModel):
    id: int
    name: str
    description: str
    effect: Optional[str] = None
    requirement: Optional[str] = None
    image: str
    type: str  # TornItemTypeEnum
    sub_type: Optional[str] = None  # TornItemWeaponTypeEnum
    is_masked: bool
    is_tradable: bool
    is_found_in_city: bool
    value: Value
    circulation: int  # int64
    details: Optional[Union[TornItemWeaponDetails, TornItemArmorDetails]] = None

class TornItemsResponse(BaseModel):
    items: List[TornItem]

class Challenge(BaseModel):
    description: str
    amount_required: int  # int64
    stat: str  # FactionStatEnum

class Upgrade(BaseModel):
    name: str
    level: int
    ability: str
    cost: int
    challenge: Optional[Challenge] = None

class TornFactionTreeBranch(BaseModel):
    id: int
    name: str
    upgrades: List[Upgrade]

class TornFactionTree(BaseModel):
    name: str
    branches: List[TornFactionTreeBranch]

class TornFactionTreeResponse(BaseModel):
    factionTree: List[TornFactionTree]

TornSelectionName = Union[str, str]  # One with enum, other any str

class TornLookupResponse(BaseModel):
    selections: List[str]  # TornSelectionName