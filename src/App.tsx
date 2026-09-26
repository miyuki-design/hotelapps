import { useState } from "react";
import { projectId } from "../utils/supabase/info";

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-37003faf`;

type IconName = "calendar" | "chevron" | "minus" | "plus" | "sparkle" | "arrow";

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    calendar: (
      <>
        <rect x="4" y="5.5" width="16" height="14" rx="2" />
        <path d="M8 3.5v4M16 3.5v4M4 9.5h16" />
      </>
    ),
    chevron: <path d="m8 10 4 4 4-4" />,
    minus: <path d="M7 12h10" />,
    plus: <path d="M12 7v10M7 12h10" />,
    sparkle: <path d="M12 3c.4 5.2 3.8 8.6 9 9-5.2.4-8.6 3.8-9 9-.4-5.2-3.8-8.6-9-9 5.2-.4 8.6-3.8 9-9Z" />,
    arrow: <path d="M5 12h13M14 7l5 5-5 5" />,
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill={name === "sparkle" ? "currentColor" : "none"}
      stroke={name === "sparkle" ? "none" : "currentColor"}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function Button({
  children,
  className,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  className: string;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  return (
    <button type="button" className={className} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(value: string, days: number) {
  const date = parseDate(value);
  date.setDate(date.getDate() + days);
  return toDateValue(date);
}

function DateField({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  onChange: (value: string) => void;
}) {
  const date = parseDate(value);

  return (
    <div className="date-card">
      <span className="date-label">{label}</span>
      <span className="date-value">
        <strong>{String(date.getDate()).padStart(2, "0")}</strong>
        <span>
          {monthNames[date.getMonth()]}
          <br />
          {dayNames[date.getDay()]}
        </span>
      </span>
      <Icon name="calendar" className="date-icon" />
      <input
        className="native-date-input"
        type="date"
        value={value}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`${label === "CHECK IN" ? "チェックイン" : "チェックアウト"}日を選択`}
      />
    </div>
  );
}

const rooms = [
  {
    id: "moon",
    label: "Full",
    title: "３食付き（休日）",
    detail: "2名・45㎡・マウンテンビュー",
    price: "¥0",
  },
  {
    id: "orbit",
    label: "Custom",
    title: "カスタム（平日）",
    detail: "2名・45㎡・マウンテンビュー",
    price: "¥0",
  },
];

export default function App() {
  const [guests, setGuests] = useState(2);
  const [selectedRoom, setSelectedRoom] = useState("moon");
  const [confirmed, setConfirmed] = useState(false);
  const [sending, setSending] = useState(false);
  const [checkIn, setCheckIn] = useState(() => toDateValue(new Date()));
  const [checkOut, setCheckOut] = useState(() => toDateValue(new Date(Date.now() + 86_400_000)));
  const room = rooms.find((item) => item.id === selectedRoom) ?? rooms[0];
  const nights = Math.max(
    1,
    Math.round((parseDate(checkOut).getTime() - parseDate(checkIn).getTime()) / 86_400_000),
  );

  const updateCheckIn = (value: string) => {
    if (!value) return;
    setCheckIn(value);
    if (parseDate(checkOut) <= parseDate(value)) {
      setCheckOut(addDays(value, 1));
    }
    setConfirmed(false);
  };

  const updateCheckOut = (value: string) => {
    if (!value) return;
    setCheckOut(value);
    setConfirmed(false);
  };

  return (
    <main className="app-shell">
      <div className="ambient ambient-top" />
      <div className="ambient ambient-bottom" />

      <div className="phone-frame">
        <header className="topbar">
          <div>
            <p className="microcopy">SHINONOI, NAGANO · EST. 2026</p>
            <p className="brand">ホテルしののい</p>
          </div>
          <Button className="menu-button" ariaLabel="メニューを開く">
            <span />
            <span />
          </Button>
        </header>

        <section className="hero">
          <img
            className="hero-image"
            src="https://images.unsplash.com/photo-1715774720257-ff7cb8aeaee1?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1080"
            alt="窓から光が差し込む、落ち着いたホテルの客室"
          />
          <div className="hero-overlay" />
          <div className="hero-status">
            <span className="status-dot" />
            <span>NOW ACCEPTING RESERVATIONS</span>
          </div>
          <div className="hero-copy">
            <p className="hero-kicker">A NEW HORIZON OF SHINSHU</p>
            <p className="hero-title">いつもの街に、<br/>静かな余白を。</p>
            <p className="hero-description">篠ノ井で過ごす、穏やかなひととき。</p>
          </div>
          <div className="room-badge">
            <span>ROOMS</span>
            <strong>24</strong>
          </div>
        </section>

        <section className="booking-panel">
          <div className="section-heading">
            <div>
              <p className="section-index">01 / BOOK YOUR STAY</p>
              <p className="section-title">宿泊日を選択</p>
            </div>
            <Icon name="sparkle" className="heading-sparkle" />
          </div>

          <div className="date-grid">
            <DateField label="CHECK IN" value={checkIn} onChange={updateCheckIn} />
            <div className="night-pill">
              <span>{nights}</span>
              <span>{nights === 1 ? "NIGHT" : "NIGHTS"}</span>
            </div>
            <DateField
              label="CHECK OUT"
              value={checkOut}
              min={addDays(checkIn, 1)}
              onChange={updateCheckOut}
            />
          </div>

          <div className="guest-row">
            <div>
              <p className="field-label">GUESTS</p>
              <p className="guest-caption">ご利用人数</p>
            </div>
            <div className="guest-stepper">
              <Button
                className="stepper-button"
                onClick={() => setGuests((value) => Math.max(1, value - 1))}
                ariaLabel="人数を減らす"
              >
                <Icon name="minus" />
              </Button>
              <span className="guest-number">{guests}</span>
              <Button
                className="stepper-button"
                onClick={() => setGuests((value) => Math.min(4, value + 1))}
                ariaLabel="人数を増やす"
              >
                <Icon name="plus" />
              </Button>
            </div>
          </div>
        </section>

        <section className="rooms-section">
          <div className="section-heading room-heading">
            <div>
              <p className="section-index">02 / SELECT A ROOM</p>
              <p className="section-title">宿泊プランを選択</p>
            </div>
            <span className="availability">2 ROOMS AVAILABLE</span>
          </div>

          <div className="room-list">
            {rooms.map((item) => {
              const selected = selectedRoom === item.id;
              return (
                <Button
                  key={item.id}
                  className={`room-card ${selected ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedRoom(item.id);
                    setConfirmed(false);
                  }}
                  ariaLabel={`${item.title}を選択`}
                >
                  <span className="room-radio">{selected ? <span /> : null}</span>
                  <span className="room-copy">
                    <span className="room-label">{item.label}</span>
                    <strong>{item.title}</strong>
                    <small>{item.detail}</small>
                  </span>
                  <span className="room-price">
                    <strong>{item.price}</strong>
                    <small>/ {nights} NIGHT{nights !== 1 ? "S" : ""}</small>
                  </span>
                </Button>
              );
            })}
          </div>
        </section>

        <section className="summary-card">
          <div className="summary-top">
            <div>
              <p className="summary-label">YOUR RESERVATION</p>
              <p className="summary-room">{room.title}</p>
            </div>
            <div className="summary-price">
              <span>合計</span>
              <strong>{room.price}</strong>
            </div>
          </div>
          <div className="summary-meta">
            <span>
              {parseDate(checkIn).getMonth() + 1}.{parseDate(checkIn).getDate()} —{" "}
              {parseDate(checkOut).getMonth() + 1}.{parseDate(checkOut).getDate()}
            </span>
            <span>{nights}泊</span>
            <span>{guests}名</span>
          </div>
          <Button
            className={`reserve-button ${confirmed ? "confirmed" : ""}`}
            onClick={async () => {
              if (confirmed || sending) return;
              setSending(true);
              try {
                await fetch(`${SERVER_URL}/notify-reservation`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    plan: room.title,
                    checkIn,
                    checkOut,
                    nights,
                    guests,
                  }),
                });
              } catch (_) {
                // 通知失敗でも予約完了扱いにする
              }
              setConfirmed(true);
              setSending(false);
            }}
            ariaLabel="この内容で予約する"
          >
            <span>{confirmed ? "予約リクエストを受け付けました" : sending ? "送信中…" : "この内容で予約する"}</span>
            {confirmed ? <Icon name="sparkle" /> : <Icon name="arrow" />}
          </Button>
          <p className="summary-note">現地決済 · 当日までキャンセル無料</p>
        </section>

        <footer className="footer">
          <span>HOTEL SHINONOI</span>
          <span>THE QUIET SIDE OF NAGANO</span>
        </footer>
      </div>
    </main>
  );
}
