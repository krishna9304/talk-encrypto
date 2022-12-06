import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import SignUp from "./pages/signup";
import { useCookies } from "react-cookie";
import { setUser, User } from "./redux/slices/user";
import { Dispatch, useEffect, useState } from "react";
import { RootState } from "./redux/store";
import { useSelector, useDispatch } from "react-redux";
import { AnyAction } from "@reduxjs/toolkit";
import networkFetch from "./utils/axios";
import { ApiRoutes, SocketActions } from "./utils/constants";
import { AxiosResponse } from "axios";
import Login from "./pages/login";
import socket from "./utils/socket";

function App() {
  const [{ jwt }, setCookie, removeCookie] = useCookies<
    "jwt",
    {
      jwt: string;
    }
  >(["jwt"]);
  const user: User = useSelector<RootState, User>(
    (state: RootState): User => state.user
  );

  const dispatch: Dispatch<AnyAction> = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  const validateJwt = async () => {
    networkFetch.defaults.headers.common["x-access-token"] = jwt;
    if (!user.userId) {
      try {
        const res: AxiosResponse<{ user: User; token: string }> =
          await networkFetch.get(ApiRoutes.self());

        dispatch(setUser(res.data.user));
        socket.emit(SocketActions.ADD_USER, res.data.user.userId);
        setCookie("jwt", res.data.token);
        setIsLoading(false);
      } catch (error: any) {
        console.error(error);
        setIsLoading(false);
        removeCookie("jwt");
      }
    }
  };

  useEffect(() => {
    if (jwt) {
      validateJwt();
    } else {
      setIsLoading(false);
    }
    return (): void => {};
  }, []);

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-black to-gray-900">
      {isLoading ? (
        "Loading..."
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
      )}
    </div>
  );
}

export default App;
