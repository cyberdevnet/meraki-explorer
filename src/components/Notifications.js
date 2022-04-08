import { useRef, useEffect, useState } from "react";
import { ReactNotifications, Store } from "react-notifications-component";
import "react-notifications-component/dist/theme.css";
import { useRecoilValue, useRecoilState } from "recoil";
import useFirstRender from "../main/useFirstRender";
import { triggerShowNotificationState, notificationMessageState, notificationTypeState } from "../main/GlobalState";
import "../styles/Explorer.css";

export default function NetworksModal() {
  const [triggerShowNotification, settriggerShowNotification] = useRecoilState(triggerShowNotificationState);
  const [notificationMessage, setnotificationMessage] = useRecoilState(notificationMessageState);
  const [notificationType, setnotificationType] = useRecoilState(notificationTypeState);
  const [contentComponent, setcontentComponent] = useState(<div></div>);
  const firstRender = useFirstRender();

  function ContentSuccess() {
    return (
      <div className="info-box bg-success">
        <span className="info-box-icon">
          <i className="fas fa-check fa-xs"></i>
        </span>

        <div className="info-box-content">
          <span className="info-box-text">Success</span>
          {Object.values(notificationMessage).map((opt, index) => {
            return <span className="info-box-number">{opt}</span>;
          })}
        </div>
      </div>
    );
  }
  function ContentInfo() {
    return (
      <div className="info-box bg-info">
        <span className="info-box-icon">
          <i className="fas fa-info-circle fa-xs"></i>
        </span>

        <div className="info-box-content">
          <span className="info-box-text">Informations</span>
          {Object.values(notificationMessage).map((opt, index) => {
            return <span className="info-box-number">{opt}</span>;
          })}
        </div>
      </div>
    );
  }
  function ContentDanger() {
    return (
      <div className="info-box bg-danger">
        <span className="info-box-icon">
          <i className="fa fa-exclamation-circle fa-xs"></i>
        </span>

        <div className="info-box-content">
          <span className="info-box-text">Error</span>
          {Object.values(notificationMessage).map((opt, index) => {
            return <span className="info-box-number">{opt}</span>;
          })}
        </div>
      </div>
    );
  }

  function ContentWarning() {
    return (
      <div className="info-box bg-warning">
        <span className="info-box-icon">
          <i className="fas fa-exclamation-triangle fa-xs"></i>
        </span>

        <div className="info-box-content">
          <span className="info-box-text">Warning</span>
          {Object.values(notificationMessage).map((opt, index) => {
            return <span className="info-box-number">{opt}</span>;
          })}
        </div>
      </div>
    );
  }

  let notificationSuccess = {
    title: "Notification",
    // message: notificationMessage,
    content: ContentSuccess(),
    type: notificationType,
    insert: "top",
    container: "top-right",
    animationIn: ["animate__animated animate__bounceIn"], // `animate.css v4` classes
    animationOut: ["animate__animated animate__bounceOut"], // `animate.css v4` classes
    dismiss: {
      duration: 2000,
      onScreen: false,
      pauseOnHover: true,
    },
  };
  let notificationInfo = {
    title: "Notification",
    // message: notificationMessage,
    content: ContentInfo(),
    type: notificationType,
    insert: "top",
    container: "top-right",
    animationIn: ["animate__animated animate__bounceIn"], // `animate.css v4` classes
    animationOut: ["animate__animated animate__bounceOut"], // `animate.css v4` classes
    dismiss: {
      duration: 2000,
      onScreen: false,
      pauseOnHover: true,
    },
  };
  let notificationWarning = {
    title: "Notification",
    // message: notificationMessage,
    content: ContentWarning(),
    type: notificationType,
    insert: "top",
    container: "top-right",
    animationIn: ["animate__animated animate__bounceIn"], // `animate.css v4` classes
    animationOut: ["animate__animated animate__bounceOut"], // `animate.css v4` classes
    dismiss: {
      duration: 2000,
      onScreen: false,
      pauseOnHover: true,
    },
  };

  let notificationDanger = {
    title: "Error",
    // message: notificationMessage,
    content: ContentDanger(),
    type: notificationType,
    insert: "top",
    container: "top-right",
    animationIn: ["animate__animated animate__bounceIn"], // `animate.css v4` classes
    animationOut: ["animate__animated animate__bounceOut"], // `animate.css v4` classes
    dismiss: {
      showIcon: true,
    },
  };

  useEffect(() => {
    // if (firstRender) {
    //   return;
    // }
    if (notificationType === "success") {
      Store.addNotification({
        ...notificationSuccess,
        container: "top-right",
      });
    } else if (notificationType === "info") {
      Store.addNotification({
        ...notificationInfo,
        container: "top-right",
      });
    } else if (notificationType === "warning") {
      Store.addNotification({
        ...notificationWarning,
        container: "top-right",
      });
    } else if (notificationType === "danger") {
      Store.addNotification({
        ...notificationDanger,
        container: "top-right",
      });
    }
  }, [triggerShowNotification]);

  return (
    <div>
      <ReactNotifications />
    </div>
  );
}
