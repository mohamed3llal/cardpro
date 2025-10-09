export class Location {
  constructor(
    public readonly address: string,
    public readonly lat: number,
    public readonly lng: number
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.address || this.address.trim() === "") {
      throw new Error("Address is required");
    }
    if (this.lat < -90 || this.lat > 90) {
      throw new Error("Latitude must be between -90 and 90");
    }
    if (this.lng < -180 || this.lng > 180) {
      throw new Error("Longitude must be between -180 and 180");
    }
  }
}
