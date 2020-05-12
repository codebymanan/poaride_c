import { User } from "./user.models";
import { Appointment } from "./appointment.models";

export class WalletHistory {
    id: number;
    user_id: number;
    title: string;
    description: string;
    status: string;;
    amount: number;
    ride: Appointment;
    user: User;
    updated_at: string;
    created_at: string;
}