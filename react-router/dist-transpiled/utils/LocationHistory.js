const RESTRICT_SIZE = 25;
export class LocationHistory {
    constructor() {
        this.locationHistory = [];
    }
    add(location) {
        this.locationHistory.push(location);
        if (this.locationHistory.length > RESTRICT_SIZE) {
            this.locationHistory.splice(0, 10);
        }
    }
    pop() {
        this.locationHistory.pop();
    }
    replace(location) {
        this.locationHistory.pop();
        this.locationHistory.push(location);
    }
    clear() {
        this.locationHistory = [];
    }
    findLastLocationByUrl(url) {
        for (let i = this.locationHistory.length - 1; i >= 0; i--) {
            const location = this.locationHistory[i];
            if (location.pathname.toLocaleLowerCase() === url.toLocaleLowerCase()) {
                return location;
            }
        }
        return undefined;
    }
    previous() {
        return this.locationHistory[this.locationHistory.length - 2];
    }
    current() {
        return this.locationHistory[this.locationHistory.length - 1];
    }
}
//# sourceMappingURL=LocationHistory.js.map