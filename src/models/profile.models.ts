import { User } from "./user.models";
import { RideLocation } from "./ride-location.models";

export class Profile {
    id: number;
    is_verified: number;
    seats: number;
    seats_available: number;
    price: number;
    user_id: number;
    distance: number;
    pickup_location_id: number;
    drop_location_id: number;
    profession: string;
    time_return: string;
    time_start: string;
    travel_days: string;
    vehicle_details: string;
    travel_days_array: Array<string>;
    vehicle_details_array: Array<string>;
    locations: Array<RideLocation>;
    locationsToShow: Array<RideLocation>;
    pickup_location: RideLocation;
    drop_location: RideLocation;
    created_at: string;
    document_url: string;
    user: User;
}