import error from "../assets/error.png";

type ErrorProps = {
  message: string;


const Error = ({ message }: ErrorProps) => {
  return (
    <div className="primaryDiv image-container">
      <img src={error} alt="Error" className="error-image" />
      <p className="error-message">Error: {message}</p>
    </div>
  );


export default Error;
