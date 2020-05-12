export class Day {
    name: string;
    selected: boolean;
    displayName: string;

    constructor(name: string, displayName: string) {
        this.name = name;
        this.displayName = displayName;
        this.selected = false;
    }

    static getDays(): Array<Day> {
        let toReturn = new Array<Day>();
        toReturn.push(new Day("mon", "Monday"));
        toReturn.push(new Day("tue", "Tuesday"));
        toReturn.push(new Day("wed", "Wednesday"));
        toReturn.push(new Day("thu", "Thursday"));
        toReturn.push(new Day("fri", "Friday"));
        toReturn.push(new Day("sat", "Saturday"));
        toReturn.push(new Day("sun", "Sunday"));
        return toReturn;
    }
}