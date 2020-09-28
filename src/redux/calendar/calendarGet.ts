import { Dispatch } from "redux";
import { CALENDAR_URL_GETMANY } from "../apiUrl";

export interface CalendarItem {
 menuItems: MenuItems[];
 date: string;
 userId: string;
}

export interface MenuItems {
 foodId: string;
 quantity: number;
}

export interface CalendarJSON {
 _id: string;
 menuItems: MenuItems[];
 date: string;
 userId: string;
 __v: number;
}

export type CalendarGetAction =
 | CalendarGetRequest
 | CalendarGetSuccess
 | CalendarGetFailure;

export const CALENDAR_GET_REQUEST = "CALENDAR_GET_REQUEST";
export const CALENDAR_GET_SUCCESS = "CALENDAR_GET_SUCCESS";
export const CALENDAR_GET_FAILURE = "CALENDAR_GET_FAILURE";

export interface CalendarGetRequest {
 type: typeof CALENDAR_GET_REQUEST;
}
export interface CalendarGetSuccess {
 type: typeof CALENDAR_GET_SUCCESS;
 payload: CalendarItem[];
}
export interface CalendarGetFailure {
 type: typeof CALENDAR_GET_FAILURE;
 payload: string;
}

export interface CalendarState {
 loading: boolean;
 calendar: CalendarItem[];
 error: string;
}

const initalState: CalendarState = {
 loading: false,
 calendar: [],
 error: "",
};

export const calendarGet = (dateList: string[], id: string) => {
 return (dispatch: Dispatch<CalendarGetAction>) => {
  dispatch({
   type: CALENDAR_GET_REQUEST,
  });
  fetch(CALENDAR_URL_GETMANY + id, {
   method: "POST",
   body: JSON.stringify({ dateList }),
   headers: {
    "Content-Type": "application/json",
   },
  })
   .then((res) => res.json())
   .then((data: CalendarJSON[]) => {
    const calendar: CalendarItem[] = data.map((calendarItem) => {
     const { userId, date } = calendarItem;
     return { userId, menuItems: [...calendarItem.menuItems], date };
    });
    dispatch({
     type: CALENDAR_GET_SUCCESS,
     payload: calendar,
    });
   })
   .catch((err) => {
    console.error(err);
    dispatch({
     type: CALENDAR_GET_FAILURE,
     payload: err.message,
    });
   });
 };
};

export const calendarGetReducer = (
 state = initalState,
 action: CalendarGetAction
): CalendarState => {
 switch (action.type) {
  case CALENDAR_GET_REQUEST:
   return {
    ...state,
    loading: true,
   };
  case CALENDAR_GET_SUCCESS:
   return {
    loading: false,
    calendar: action.payload,
    error: "",
   };
  case CALENDAR_GET_FAILURE:
   return {
    loading: false,
    calendar: [],
    error: action.payload,
   };
  default:
   return state;
 }
};
