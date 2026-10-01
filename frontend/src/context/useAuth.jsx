import { useContext } from "react";
import { userContext } from "./authContext";

export const useAuth = () => {
  return useContext(userContext);
};