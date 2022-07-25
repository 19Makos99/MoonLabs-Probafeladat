import { yupResolver } from '@hookform/resolvers/yup';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useRef } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import * as yup from "yup";
import RegisterPopup from './RegisterPopup';
import styles from "./CodeUpload.module.css";

const schema = yup.object({
  email: yup.string().required("Az email mező kitöltése kötelező.").email("Az email nem megfelelő formátumú."),
  code: yup.string().required("A kód mező kitöltése kötelező.").length(8, "A kódnak 8 karakter hosszúnak kell lennie.").matches(/[a-zA-Z0-9]{8}/g, "A kód csak betűket és számokat tartalmazhat."),
  day: yup.date().min(new Date(2022, 6, 1), "A napnak 2022.07.01 utáni dátumnak kell lennie.").max(new Date(2022, 7, 31, 23, 59, 59), "A napnak 2022.09.01 elötti dátumnak kell lennie.").max(new Date(), "Nem lehet jövőbeli napot választani."),
  hour: yup.number().min(0, "Az óra mező kitöltése kötelező.").max(23),
  minute: yup.number().min(0, "A perc mező kitöltése kötelező.").max(59),
}).required();

let errorCodes = {
  "email:invalid": "Hibás emailt adott meg.",
  "email:required": "Az email mező kitöltése kötelező.",
  "code:invalid": "Hibás kód.",
  "code:required": "A kód megadása kötelező.",
  "purchase_time:required": "A dátum megadása kötlező.",
  "purchase_time:invalid": "Hibás dátum.",
  "purchase_time:too_early": "A megadott dátum túl korai.",
  "purchase_time:too_late": "A megadott dátum túl késő.",
};


export default function CodeUpload(props) {
  const [processing, setProcessing] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const formRef = useRef(null);
  const { register, watch, handleSubmit } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "a@gmail.com",
      code: "asdf1234",
      day: convertDateToValue(new Date()),
      hour: "1",
      minute: "1",
    }
  });
 

  const onSubmit = (data) => {
    fetch("https://ncp-dummy.staging.moonproject.io/api/mohacsi-akos/code/upload", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: data.email,
        code: data.code,
        purchase_time: formatPurchaseTime(data.day, data.hour, data.minute),
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.errors) {
        if (data.errors.some((error) => { return error.code === "email:not_found"; })) {
          toast.warn("Ön még nem regisztrált, a regisztráció kötelező.");
          setIsPopupOpen(true);
          return;
        }

        data.errors.forEach((error) => {
          toast.warn(errorCodes[error.code]);
        });
      }

      if (data.data) {
        const won = data.data.won;
        if (won) {
          toast.success("Nyertél.");
        } else {
          toast.info("Nem nyertél.");
        }
        return;
      }
    })
    .catch((error) => {
      toast.error("Hiba történt.");
      console.error("HIBA" + error);
    })
    .finally(() => setProcessing(false));
  };

  const onRegister = () => {
    setIsPopupOpen(false);
    formRef.current.dispatchEvent(
      new Event("submit", {
        cancelable: true,
        bubbles: true
      })
    );
  };

  return (
    <>
      <RegisterPopup
        onError={props.onError}
        isPopupOpen={isPopupOpen}
        onPopupClose={() => {setIsPopupOpen(false);}}
        onRegister={onRegister}
        email={watch("email")} />
      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit, props.onError)}>
        <Container className={styles.body}>
          <Row>
            <h1 className={styles.center} >Kódfeltöltés</h1>
          </Row>
          <Row>
            <label className={`${styles.center} ${styles.label}`} >E-mail cím:</label>
          </Row>
          <Row className={styles.space}>
            <Col>
              <input style={{width: "100%"}} {...register("email")} />
            </Col>
          </Row>
          <Row>
            <label className={`${styles.center} ${styles.label}`} >Kód:</label>
          </Row>
          <Row className={styles.space}>
            <Col>
              <input className={styles.input} {...register("code")} />
            </Col>
          </Row>
          <Row>
            <label className={`${styles.center} ${styles.label}`} >Vásárlás dátuma:</label>
          </Row>
          <Row>
            <Col xs={8}>
              <label className={`${styles.center} ${styles.label}`}>Nap:</label>
            </Col>
            <Col>
              <label className={`${styles.center} ${styles.label}`}>Óra:</label>
            </Col>
            <Col>
              <label className={`${styles.center} ${styles.label}`}>Perc:</label>
            </Col>
          </Row>
          <Row className={`justify-content-md-center ${styles.space}`}>
            <Col xs={8}>
              <select style={{width: "100%"}} {...register("day")} >
                {generateMonthOptionArray()}
              </select>
            </Col>
            <Col>
              <select style={{width: "100%"}} {...register("hour")}>
                <option value="-1"></option>
                {generateOptionArray(24)}
              </select>
            </Col>
            <Col>
              <select style={{width: "100%"}} {...register("minute")}>
                <option value="-1"></option>
                {generateOptionArray(60)}
              </select>
            </Col>
          </Row>
          <Row>
            <Col className={styles.center}>
              <input type='submit' value="Kódfeltöltés" disabled={processing} />
            </Col>
          </Row>
        </Container>
      </form>
    </>
  );
}

const formatPurchaseTime = (day, hour, minute) => {
  return `${day.getFullYear()}-${(day.getMonth()+1).toString().padStart(2, '0')}-${day.getDate()} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

const months = [
  "Január", "Február", "Március", "Április",
  "Május", "Június", "Július", "Augusztus",
  "Szeptember", "Október", "November", "December"
];

const convertDateToText = (date) => {
  return months[date.getMonth()] + " " + date.getDate() + ".";
}

const convertDateToValue = (date) => {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

const generateMonthOptionArray = () => {
  const firstDate = new Date(2022, 6, 1);
  const today = new Date();
  const maxDate = new Date(2022, 7, 31, 23, 59, 59);
  const lastDate = maxDate < today ? maxDate : today;
  
  let currentDate = firstDate;
  let result = [];
  while (currentDate < lastDate) {
    const value = convertDateToValue(currentDate);
    const text = convertDateToText(currentDate);
    result.push(<option key={value} value={value}>{text}</option>);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return result;
}

const generateOptionArray = (limit) =>{
  const arr = [];
  for (let i = 0; i < limit; i++) {
    arr.push(<option key={i} value={i}>{i}</option>);
  }
  return arr;
}