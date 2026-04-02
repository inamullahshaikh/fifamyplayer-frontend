/**
 * Image assets for clubs, competitions, trophies, and awards.
 * Used in the Season Data form.
 */

// Teams - map team id to image path
import acMilan from "../assets/images/teams/AC Milan.png";
import arsenalFc from "../assets/images/teams/Arsenal FC.png";
import asMonaco from "../assets/images/teams/AS Monaco.png";
import asRoma from "../assets/images/teams/AS Roma.png";
import astonVilla from "../assets/images/teams/Aston Villa.png";
import athleticBilbao from "../assets/images/teams/Athletic Bilbao.png";
import atleticoMadrid from "../assets/images/teams/Atlético de Madrid.png";
import bayerLeverkusen from "../assets/images/teams/Bayer 04 Leverkusen.png";
import bayernMunich from "../assets/images/teams/Bayern Munich.png";
import borussiaDortmund from "../assets/images/teams/Borussia Dortmund.png";
import borussiaMgladbach from "../assets/images/teams/Borussia Mönchengladbach.png";
import chelseaFc from "../assets/images/teams/Chelsea FC.png";
import eintrachtFrankfurt from "../assets/images/teams/Eintracht Frankfurt.png";
import fcBarcelona from "../assets/images/teams/FC Barcelona.png";
import interMilan from "../assets/images/teams/Inter Milan.png";
import juventusFc from "../assets/images/teams/Juventus FC.png";
import liverpoolFc from "../assets/images/teams/Liverpool FC.png";
import loscLille from "../assets/images/teams/LOSC Lille.png";
import manCity from "../assets/images/teams/Manchester City.png";
import manUnited from "../assets/images/teams/Manchester United.png";
import newcastleUnited from "../assets/images/teams/Newcastle United.png";
import ogcNice from "../assets/images/teams/OGC Nice.png";
import olympiqueLyon from "../assets/images/teams/Olympique Lyon.png";
import olympiqueMarseille from "../assets/images/teams/Olympique Marseille.png";
import psg from "../assets/images/teams/Paris Saint-Germain.png";
import rbLeipzig from "../assets/images/teams/RB Leipzig.png";
import realMadrid from "../assets/images/teams/Real Madrid.png";
import sevillaFc from "../assets/images/teams/Sevilla FC.png";
import ssLazio from "../assets/images/teams/SS Lazio.png";
import sscNapoli from "../assets/images/teams/SSC Napoli.png";
import tottenham from "../assets/images/teams/Tottenham Hotspur.png";
import valenciaCf from "../assets/images/teams/Valencia CF.png";
import vflWolfsburg from "../assets/images/teams/VfL Wolfsburg.png";
import villarrealCf from "../assets/images/teams/Villarreal CF.png";

// Club competition logos
import laLigaLogo from "../assets/images/logos/la-liga.png";
import copaDelReyLogo from "../assets/images/logos/copa-del-rey.png";
import superCopaLogo from "../assets/images/logos/super-copa-de-espana.png";
import championsLeagueLogo from "../assets/images/logos/champions-league.png";
import conferenceLeagueLogo from "../assets/images/logos/uefa-conference-league-logo.png";
import uefaSuperCupLogo from "../assets/images/logos/uefa-super-cup.png";
import premierLeagueLogo from "../assets/images/logos/premier-league.png";
import faCupLogo from "../assets/images/logos/fa-cup.png";
import carabaoCupLogo from "../assets/images/logos/carabao-cup.png";
import communityShieldLogo from "../assets/images/logos/community-shield.png";
import bundesligaLogo from "../assets/images/logos/bundesliga.png";
import dfbPokalLogo from "../assets/images/logos/dfb-pokal.png";
import dflSupercupLogo from "../assets/images/logos/dfl-supercup.png";
import serieALogo from "../assets/images/logos/serie-a.png";
import copaItaliLogo from "../assets/images/logos/copa-italia.png";
import supercoppaLogo from "../assets/images/logos/supercoppa_italiana.png";
import ligue1Logo from "../assets/images/logos/ligue-1.png";
import coupeFranceLogo from "../assets/images/logos/Coupe-de-France.png";
import tropheeChampionsLogo from "../assets/images/logos/Trophee-des-Champions.png";

import { getFlagUrlByCode, toNationalityCode } from "./nationalities";

// International competition logos
import euroLogo from "../assets/images/logos/euro.png";
import worldCupLogo from "../assets/images/logos/world-cup.png";
import euroQualLogo from "../assets/images/logos/euro-qual.png";
import worldCupQualLogo from "../assets/images/logos/world-cup-qual.png";
import friendliesLogo from "../assets/images/logos/international-friendlies.png";
import finalissimaLogo from "../assets/images/logos/finalissima.png";
import copaAmericaLogo from "../assets/images/logos/Copa-America.png";
import conmebolLogo from "../assets/images/logos/conmebol.png";
import goldCupLogo from "../assets/images/logos/concacaf gold cup.png";
import concacafNationsLeagueLogo from "../assets/images/logos/CONCACAF Nations League.png";
import afcAsianCupLogo from "../assets/images/logos/AFC_Asian_Cup.png";
import afconLogo from "../assets/images/logos/afcon.png";

// Award logos
import ballonDorLogo from "../assets/images/logos/ballon-dor.png";
import goldenBootLogo from "../assets/images/logos/golden-boot.png";
import fifaBestLogo from "../assets/images/logos/fifa-the best.png";

import type {
  ClubCompetitionId,
  ClubTrophyId,
  IntCompetitionId,
  IntTrophyId,
} from "./seasonDataConfig";

export function getNationImage(nationality: string): string | undefined {
  if (!nationality) return undefined;
  const code = toNationalityCode(nationality);
  if (!code) return undefined;
  return getFlagUrlByCode(code, 64);
}

export const TEAM_IMAGES: Record<string, string> = {
  "ac-milan": acMilan,
  "arsenal-fc": arsenalFc,
  "as-monaco": asMonaco,
  "as-roma": asRoma,
  "aston-villa": astonVilla,
  "athletic-bilbao": athleticBilbao,
  "atletico-de-madrid": atleticoMadrid,
  "bayer-04-leverkusen": bayerLeverkusen,
  "bayern-munich": bayernMunich,
  "borussia-dortmund": borussiaDortmund,
  "borussia-monchengladbach": borussiaMgladbach,
  "chelsea-fc": chelseaFc,
  "eintracht-frankfurt": eintrachtFrankfurt,
  barcelona: fcBarcelona,
  "inter-milan": interMilan,
  "juventus-fc": juventusFc,
  "liverpool-fc": liverpoolFc,
  "losc-lille": loscLille,
  "manchester-city": manCity,
  "manchester-united": manUnited,
  "newcastle-united": newcastleUnited,
  "ogc-nice": ogcNice,
  "olympique-lyon": olympiqueLyon,
  "olympique-marseille": olympiqueMarseille,
  "paris-saint-germain": psg,
  "rb-leipzig": rbLeipzig,
  "real-madrid": realMadrid,
  "sevilla-fc": sevillaFc,
  "ss-lazio": ssLazio,
  "ssc-napoli": sscNapoli,
  "tottenham-hotspur": tottenham,
  "valencia-cf": valenciaCf,
  "vfl-wolfsburg": vflWolfsburg,
  "villarreal-cf": villarrealCf,
};

export const CLUB_COMPETITION_IMAGES: Record<ClubCompetitionId, string> = {
  ll: laLigaLogo,
  cdr: copaDelReyLogo,
  sde: superCopaLogo,
  ucl: championsLeagueLogo,
  uesc: uefaSuperCupLogo,
  uecl: conferenceLeagueLogo,
  usc: uefaSuperCupLogo,
  pl: premierLeagueLogo,
  fa: faCupLogo,
  efl: carabaoCupLogo,
  cs: communityShieldLogo,
  bl: bundesligaLogo,
  dfb: dfbPokalLogo,
  dfl: dflSupercupLogo,
  sa: serieALogo,
  ci: copaItaliLogo,
  si: supercoppaLogo,
  l1: ligue1Logo,
  cdf: coupeFranceLogo,
  tdc: tropheeChampionsLogo,
};

export const CLUB_TROPHY_IMAGES: Record<ClubTrophyId, string> = {
  "ll-trophy": laLigaLogo,
  "cdr-trophy": copaDelReyLogo,
  "sde-trophy": superCopaLogo,
  "ucl-trophy": championsLeagueLogo,
  "uesc-trophy": uefaSuperCupLogo,
  "uecl-trophy": conferenceLeagueLogo,
  "usc-trophy": uefaSuperCupLogo,
  "pl-trophy": premierLeagueLogo,
  "fa-trophy": faCupLogo,
  "efl-trophy": carabaoCupLogo,
  "cs-trophy": communityShieldLogo,
  "bl-trophy": bundesligaLogo,
  "dfb-trophy": dfbPokalLogo,
  "dfl-trophy": dflSupercupLogo,
  "sa-trophy": serieALogo,
  "ci-trophy": copaItaliLogo,
  "si-trophy": supercoppaLogo,
  "l1-trophy": ligue1Logo,
  "cdf-trophy": coupeFranceLogo,
  "tdc-trophy": tropheeChampionsLogo,
};

export const INT_COMPETITION_IMAGES: Record<IntCompetitionId, string> = {
  friendly: friendliesLogo,
  wcq: worldCupQualLogo,
  wc: worldCupLogo,
  finalissima: finalissimaLogo,
  euro: euroLogo,
  euq: euroQualLogo,
  unl: euroQualLogo, // UEFA Nations League — no dedicated asset yet
  "copa-america": copaAmericaLogo,
  "conmebol-qualifiers": conmebolLogo,
  "gold-cup": goldCupLogo,
  "concacaf-nations-league": concacafNationsLeagueLogo,
  "asian-cup": afcAsianCupLogo,
  "asian-cup-qualifiers": afcAsianCupLogo,
  afcon: afconLogo,
  "afcon-qualifiers": afconLogo,
  "ofc-nations-cup": worldCupLogo, // no OFC asset in logos folder yet
};

export const INT_TROPHY_IMAGES: Record<IntTrophyId, string> = {
  "european-championship": euroLogo,
  "world-cup": worldCupLogo,
  "nations-league": euroQualLogo, // UEFA Nations League — no dedicated asset yet
  "copa-america": copaAmericaLogo,
  "gold-cup": goldCupLogo,
  "asian-cup": afcAsianCupLogo,
  afcon: afconLogo,
  "ofc-nations-cup": worldCupLogo,
};

/** Only Ballon d&apos;Or, Golden Boot, and FIFA Best use logo assets from `assets/images/logos/`. */
export const AWARD_LOGO_KINDS: readonly {
  id: string;
  label: string;
  name: string;
  pattern: RegExp;
  image: string;
}[] = [
  {
    id: "ballon",
    label: "Ballon d'Or",
    name: "Ballon d'Or",
    pattern: /ballon\s*d'?or/i,
    image: ballonDorLogo,
  },
  {
    id: "golden",
    label: "Golden Boot",
    name: "Golden Boot",
    pattern: /golden\s*boot/i,
    image: goldenBootLogo,
  },
  {
    id: "fifa",
    label: "FIFA Best Player",
    name: "FIFA Men's Best Player",
    pattern: /fifa\s*best\s*player/i,
    image: fifaBestLogo,
  },
];

export function getAwardImage(awardName: string): string | undefined {
  const s = awardName.trim();
  if (!s) return undefined;
  for (const { pattern, image } of AWARD_LOGO_KINDS) {
    if (pattern.test(s)) return image;
  }
  return undefined;
}

/** Club or international competition id → logo URL. */
export function getCompetitionLogo(compId: string): string | undefined {
  if (!compId) return undefined;
  const cid = compId as ClubCompetitionId;
  if (cid in CLUB_COMPETITION_IMAGES) return CLUB_COMPETITION_IMAGES[cid];
  const iid = compId as IntCompetitionId;
  if (iid in INT_COMPETITION_IMAGES) return INT_COMPETITION_IMAGES[iid];
  return undefined;
}

/** Trophy id (e.g. ucl-trophy, world-cup) → logo URL. */
export function getTrophyLogo(trophyId: string): string | undefined {
  if (!trophyId) return undefined;
  const cid = trophyId as ClubTrophyId;
  if (cid in CLUB_TROPHY_IMAGES) return CLUB_TROPHY_IMAGES[cid];
  const iid = trophyId as IntTrophyId;
  if (iid in INT_TROPHY_IMAGES) return INT_TROPHY_IMAGES[iid];
  return undefined;
}
