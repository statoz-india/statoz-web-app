import type { TournamentSummary } from "@/lib/models/common/tournament-model";
import type {
  EventOption,
  EventPickType,
  EventStatus,
} from "@/lib/types/event-type";

export type Event = {
  _id: string;
  eventId: string;
  eventName: string;
  eventDescription: string;
  eventImage: string;
  eventDescriptionImage: string | null;
  eventStatus: EventStatus;
  pickType: EventPickType;
  isRacingMatchEvent: boolean;
  /** The tournament's id here, not its code as on a fixture. */
  tournament: string;
  tournamentData: TournamentSummary;
  haveThreeOptions: boolean;
  yesPlaceholder: string;
  noPlaceholder: string;
  maybePlaceholder: string | null;
  yesPlaceholderColor: string;
  noPlaceholderColor: string;
  maybePlaceholderColor: string | null;
  yesTextColor: string;
  noTextColor: string;
  maybeTextColor: string | null;
  entryStartTime: string;
  entryCloseTime: string;
  coinsOnYes: number;
  coinsOnNo: number;
  coinsOnMaybe: number | null;
  initialCoinsOnYes: number;
  initialCoinsOnNo: number;
  initialCoinsOnMaybe: number | null;
  totalCoins: number;
  oddsYes: number;
  oddsNo: number;
  oddsMaybe: number | null;
  createdAt: string;
  updatedAt: string;
  /** Appears once the result is set. */
  winningOption?: EventOption;
};
