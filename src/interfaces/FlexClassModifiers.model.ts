//`wl-justify-content-${JustificationModifier}`
export type JustificationModifier =
  | "end"
  | "center"
  | "start"
  | "between"
  | "evenly"
  | "around";
//wl-align-items-${AlignmentModifier}
export type AlignmentModifier =
  | "end"
  | "center"
  | "start"
  | "baseline"
  | "stretch";

export type WrapType = "nowrap" | "wrap" | "wrap-reverse";

// .wl-nowrap	flex-wrap: nowrap	Items will all be on one line.
//.wl-wrap	flex-wrap: wrap	Items will wrap onto multiple lines, from top to bottom.
//.wl-wrap-reverse
