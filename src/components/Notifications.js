import { useRef, useEffect, useState } from "react";
import { ReactNotifications, Store } from "react-notifications-component";
import "react-notifications-component/dist/theme.css";
import { useRecoilValue, useRecoilState } from "recoil";
import useFirstRender from "../main/useFirstRender";
import {
  triggerShowNotificationState,
  notificationMessageState,
  notificationTypeState,
} from "../main/GlobalState";

export default function NetworksModal() {
  const [triggerShowNotification, settriggerShowNotification] = useRecoilState(
    triggerShowNotificationState
  );
  const [notificationMessage, setnotificationMessage] = useRecoilState(notificationMessageState);
  const [notificationType, setnotificationType] = useRecoilState(notificationTypeState);
  const firstRender = useFirstRender();

  let notification = {
    title: "Notification",
    message: notificationMessage,
    type: notificationType,
    insert: "top",
    container: "top-right",
    animationIn: ["animate__animated animate__bounceIn"], // `animate.css v4` classes
    animationOut: ["animate__animated animate__bounceOut"], // `animate.css v4` classes
    dismiss: {
      duration: 2000,
      onScreen: true,
      pauseOnHover: true,
    },
  };

  useEffect(() => {
    if (firstRender) {
      return;
    }
    Store.addNotification({
      ...notification,
      container: "top-right",
    });
  }, [triggerShowNotification]);

  return (
    <div>
      <ReactNotifications />
    </div>
  );
}
