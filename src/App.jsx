import { ToastContainer, toast } from "react-toastify";
import React from 'react';
import CodeUpload from "./CodeUpload";
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const onError = (error) => {
    Object.entries(error).forEach(([type, messageObj]) => {
      toast.warn(messageObj.message);
    });
  };

  return (
    <>
      <ToastContainer
        position="top-right"
      />
      <CodeUpload onError={onError} />
    </>
  );
}