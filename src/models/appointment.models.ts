import { User } from "./user.models";
import { Profile } from "./profile.models";
import { Address } from "./address.models";
import { StatusLog } from "./status-log.models";

export class Appointment {
    id: number;
    provider_id: number;
    user_id: number;
    seats: number;
    price: number;
    myRating: number;
    address_from: string;
    address_to: string;
    latitude_from: string;
    latitude_to: string;
    longitude_from: string;
    longitude_to: string;
    ride_on: string;
    ride_on_time: string;
    ride_on_date: string;
    status: string;
    created_at: string;
    updated_at: string;
    user: User;
    provider: Profile;
    address: Address;
    logs: Array<StatusLog>;
}