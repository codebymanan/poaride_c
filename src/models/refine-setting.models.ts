export class RefineSetting {
  vegOnly: boolean;
  cost_for_two_sort: string; //asc dsc
  cost_for_two_min: number;
  cost_for_two_max: number;

  constructor() {
    this.vegOnly = false;
    this.cost_for_two_sort = "asc";
    this.cost_for_two_min = 1;
    this.cost_for_two_max = 1000;
  }
}