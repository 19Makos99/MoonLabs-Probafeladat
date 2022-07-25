import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from "react";
import { Container, Row } from 'react-bootstrap';
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';
import * as yup from "yup";
import styles from "./Register.module.css";

const schema = yup.object({
  email: yup.string().required("Az email mező kitöltése kötelező.").email("Az email nem megfelelő formátumú."),
  name: yup.string().required("A név megadása kötelező.").min(1, "A névnek legalább 2 karakter hosszúnak kell lennie."),
  agree: yup.bool().isTrue("A játékszabályzat elfogadása kötelező."),
});

let errorCodes = {
  "email:invalid": "Hibás emailt adott meg.",
  "email:required": "Az email mező kitöltése kötelező.",
  "name:invalid": "Hibás nevet adott meg.",
  "name:required": "A név megadása kötelező.",
};

export default function Register(props) {
  const [ processing, setProcessing ] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      email: props.email,
      name: "",
      agree: false,
    },
    resolver: yupResolver(schema)
  });

  const onSubmit = (data) => {
    setProcessing(true);
    fetch("https://ncp-dummy.staging.moonproject.io/api/mohacsi-akos/user/register", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: data.email,
        name: data.name,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data?.errors) {
        data.errors.forEach((error ) => {
          toast.warn(errorCodes[error.code]);
        });
        return;
      }
      
      if (data.data?.success) {
        props.onRegister();
        toast.success("Sikeresen regisztrált.");
        return;
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error("Hiba történt.");
    })
    .finally(() => setProcessing(false));
  };

  return (
      <form onSubmit={handleSubmit(onSubmit, props.onError)}>
        <Container className={styles.body}>
          <Row>
            <h1 className={styles.center}>Regisztráció</h1>
          </Row>
          <Row>
            <label className={`${styles.label} ${styles.center}`} >Email Cím:</label>
          </Row>
          <Row className={styles.space}>
            <input className={styles.input} {...register("email")} disabled />
          </Row>
          <Row>
            <label className={`${styles.label} ${styles.center}`} >NÉV:</label>
          </Row>
          <Row className={styles.space}>
            <input {...register("name")} />
          </Row>
          <Row className={styles.space}>
            <input id="szabalyzat" type="checkbox" {...register("agree")} />
            <label className={styles.center} htmlFor="szabalyzat">Elolvastam és elfogadtam a játékszabályzatot.</label>
          </Row>
          <Row className={styles.space}>
            <input type='submit' value="Regisztrálok" disabled={processing} />
          </Row>
        </Container>
      </form>
  );
}