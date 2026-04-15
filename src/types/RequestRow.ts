export interface RequestRow {
  id: string;
  employee: string;
  purpose: string;
  amount: number;
  date: string;
  status: {
    label: string;
    type: "compliant" | "violation" | "pending";
    icon: unknown;
  };
  aiAction: {
          icon: unknown,
          text: string,
          color: string,
        },
  quickNote: string;
}
