type PoolSource = { kind: "pool" };
type PersonalSource = { kind: "personal"; memberId: string };
export type Source = PoolSource | PersonalSource;
export function isPersonalSource(s: Source): s is PersonalSource {
  return s.kind === "personal";
}
