import { useEffect } from "react";
import { ReactNotifications, Store } from "react-notifications-component";
import "react-notifications-component/dist/theme.css";
import { useRecoilState } from "recoil";
import useFirstRender from "../main/useFirstRender";
import { triggerShowNotificationState, notificationMessageState, notificationTypeState } from "../main/GlobalState";
import "../styles/Explorer.css";
import "../styles/Notifications.css";

export default function NetworksModal() {
  const [triggerShowNotification, settriggerShowNotification] = useRecoilState(triggerShowNotificationState);
  const [notificationMessage, setnotificationMessage] = useRecoilState(notificationMessageState);
  const [notificationType, setnotificationType] = useRecoilState(notificationTypeState);
  const firstRender = useFirstRender();

  function ContentSuccess() {
    return (
      <div className="wrapper">
        <div className="toast toast_success">
          <div className="content">
            <div className="icon_success">
              <i className="fas fa-check fa-xs"></i>
            </div>
            <div className="details">
              <span>Success</span>
              {Object.values(notificationMessage).map((opt, index) => {
                return (
                  <p key={index} className="info-box-number">
                    {opt}
                  </p>
                );
              })}
            </div>
          </div>
          <div className="close-icon">
            <i className="uil uil-times"></i>
          </div>
        </div>
      </div>
    );
  }
  function ContentInfo() {
    return (
      <div className="wrapper">
        <div className="toast toast_info">
          <div className="content">
            <div className="icon_info">
              <i className="fas fa-info-circle fa-xs"></i>
            </div>
            <div className="details">
              <span>Informations</span>
              {Object.values(notificationMessage).map((opt, index) => {
                return (
                  <p key={index} className="info-box-number">
                    {opt}
                  </p>
                );
              })}
            </div>
          </div>
          <div className="close-icon">
            <i className="uil uil-times"></i>
          </div>
        </div>
      </div>
    );
  }
  function ContentDanger() {
    return (
      <div className="wrapper">
        <div className="toast toast_error">
          <div className="content">
            <div className="icon_error">
              <i className="fa fa-exclamation-circle fa-xs"></i>
            </div>
            <div className="details">
              <span>Error</span>
              {Object.values(notificationMessage).map((opt, index) => {
                return (
                  <p key={index} className="info-box-number">
                    {opt}
                  </p>
                );
              })}
            </div>
          </div>
          <div className="close-icon">
            <i className="uil uil-times"></i>
          </div>
        </div>
      </div>
    );
  }

  function ContentWarning() {
    return (
      <div className="wrapper">
        <div className="toast toast_warning">
          <div className="content">
            <div className="icon_warning">
              <i className="fas fa-exclamation-triangle fa-xs"></i>
            </div>
            <div className="details">
              <span>Warning</span>
              {Object.values(notificationMessage).map((opt, index) => {
                return (
                  <p key={index} className="info-box-number">
                    {opt}
                  </p>
                );
              })}
            </div>
          </div>
          <div className="close-icon">
            <i className="uil uil-times"></i>
          </div>
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
    if (firstRender) {
      return;
    }
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
