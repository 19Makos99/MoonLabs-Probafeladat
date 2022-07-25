import Popup from "reactjs-popup";
import Register from "./Register";
import "./RegisterPopup.css";

export default function RegisterPopup(props) {
  return (
    <Popup
      open={props.isPopupOpen}
      onClose={props.onPopupClose}>
      <Register
        email={props.email}
        onError={props.onError}
        onRegister={props.onRegister}
      />
    </Popup>
  );
  
}