import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import { Setting } from './setting.models';
import { Constants } from './constants.models';
import { StatusLog } from './status-log.models';
import moment from 'moment';

export class Helper {
    static getChatChild(userId: string, myId: string) {
        //example: userId="9" and myId="5" -->> chat child = "5-9"
        let values = [userId, myId];
        values.sort((one, two) => (one > two ? -1 : 1));
        return values[0] + "-" + values[1];
    }

    static getTimeDiff(date: Date) {
        TimeAgo.addLocale(en);
        return new TimeAgo('en-US').format(date);
    }

    static formatMillisDateTime(millis: number): string {
        return moment(millis).format("ddd, MMM D, h:mm a");
    }

    static formatTimestampDateTime(timestamp: string): string {
        return moment(timestamp).format("ddd, MMM D, h:mm a");
    }

    static formatMillisDate(millis: number): string {
        return moment(millis).format("DD MMM YYYY");
    }

    static formatTimestampDate(timestamp: string): string {
        return moment(timestamp).format("DD MMM YYYY");
    }

    static formatMillisTime(millis: number): string {
        return moment(millis).format("h:mm a");
    }

    static formatTimestampTime(timestamp: string): string {
        return moment(timestamp).format("h:mm a");
    }

    static getSetting(settingKey: string) {
        let settings: Array<Setting> = JSON.parse(window.localStorage.getItem(Constants.KEY_SETTING));
        let toReturn: string;
        if (settings) {
            for (let s of settings) {
                if (s.key == settingKey) {
                    toReturn = s.value;
                    break;
                }
            }
        }
        if (!toReturn) toReturn = "";
        return toReturn;
    }

    static getLogTimeForStatus(status: string, logs: Array<StatusLog>) {
        let toReturn = "";
        if (status && logs) {
            for (let log of logs) {
                if (log.status == status) {
                    toReturn = log.created_at;
                    break;
                }
            }
        }
        return toReturn;
    }

    static isEmpty(field: string) {
        return !field || !field.length;
    }
}