export type Report = {
  score: number;
  level: string;
  color: string;
  scores: { innovation: number; marketDemand: number; feasibility: number; monetization: number };
  market: string;
  audience: string;
  competitors: string;
  risks: string;
  businessModel: string;
  recommendations: string[];
};
