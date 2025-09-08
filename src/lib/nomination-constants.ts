export const EOM_SUBMIT_POINTS = 10;      // submitter gets immediately
export const LINKEDIN_APPROVE_POINTS = 10; // submitter gets on approval
export const EOM_WINNER_POINTS = 100;      // winner gets at month end

export function monthKeyFromDate(d = new Date()) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2,"0")}`;
}
