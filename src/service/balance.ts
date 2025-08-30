import { Pool } from "../models/Pool.js";
import { Member } from "../models/Member.js";
import { isPersonalSource, type Source } from "../lib/source.js";

export async function getBalanceForSource(source: Source): Promise<number> {
  if (source.kind === "pool") {
    const pool = await Pool.findById("main").lean();
    return pool?.amount ?? 0;
  }
  if (isPersonalSource(source)) {
    const member = await Member.findById(source.memberId).lean();
    return member?.balance ?? 0;
  }
  return 0;
}
