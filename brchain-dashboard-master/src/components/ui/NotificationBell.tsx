"use client";
import React, { useState } from "react";
import Image from "next/image";

interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
}

interface NotificationBellProps {
  notifications: Notification[];
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
}) => {
  const [showPopup, setShowPopup] = useState(false);

  const handleToggle = () => {
    setShowPopup(!showPopup);
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="bg-transparent border-none cursor-pointer p-1 relative"
        aria-label="Notificações"
      >
        <Image
          src="/icons/notification-bell.svg"
          alt="Sino de notificações"
          width={32}
          height={34}
        />
      </button>

      {showPopup && (
        <div
          className="absolute top-10 right-0 
                     bg-white border border-gray-200 rounded-lg shadow-xl 
                     z-50 pt-6 pl-8.5 pr-5.5"
          style={{
            width: "512px",
            height: "240px",
            overflowY: "auto",
          }}
        >
          <div className="max-h-[200px] overflow-y-hidden">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex py-3 items-center">
                <div className="grow">
                  <p className="text-black text-base font-medium max-w-[360px]">
                    {notification.title}
                  </p>
                  <p className="text-[#7F7F7F] text-sm font-normal max-w-[360px]">
                    {notification.description}
                  </p>
                </div>

                <div className="text-[#7F7F7F] text-sm font-normal">
                  {notification.time}
                </div>
              </div>
            ))}
          </div>

          <div
            className="text-center py-2
                       absolute bottom-0 left-0 right-0 bg-white rounded-b-lg"
          >
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-[#24BEFE] no-underline text-base font-semibold block py-2"
            >
              Ver Tudo
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
