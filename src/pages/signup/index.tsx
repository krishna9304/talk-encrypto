import { ChangeEvent, FunctionComponent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ApiRoutes, SocketActions } from "../../utils/constants";
import { setUser } from "../../redux/slices/user";
import { useNavigate } from "react-router-dom";
import networkFetch from "../../utils/axios";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import socket from "../../utils/socket";

interface SignUpProps {}

const SignUp: FunctionComponent<SignUpProps> = () => {
  const { user } = useSelector((state: RootState) => state);
  const initialSignupData = {
    userId: "",
    name: "",
    email: "",
    phone: "",
    password: "",
  };
  const [signupData, setSignupData] = useState(initialSignupData);
  const [showPass, setShowPass] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSignupData((sd) => ({
      ...sd,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    const errs = [];
    // Regular expression to check if string is email
    const regexExp =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;
    if (!signupData.email.length) errs.push("Email field is mandatory.");
    else if (!regexExp.test(signupData.email)) errs.push("Invalid Email.");
    if (!signupData.name.length) errs.push("Name field is mandatory.");
    if (!signupData.userId.length) errs.push("You must provide an userId.");
    else if (signupData.userId.length < 6)
      errs.push("UserId must be more than 6 characters.");
    if (!signupData.phone.length) errs.push("Phone field is mandatory.");
    else if (signupData.phone.length !== 10)
      errs.push("Please provide a valid phone number.");
    return errs;
  };

  const handleSubmit = async () => {
    try {
      const errs: Array<String> = validateForm();
      if (errs.length) errs.forEach((msg) => toast(msg, { type: "warning" }));
      else {
        const res = await networkFetch.post(ApiRoutes.register(), signupData);
        dispatch(setUser(res.data?.user));
        socket.emit(SocketActions.ADD_USER, res.data?.user.userId);
        const token = res.data.token;
        document.cookie = "jwt=" + token;
        toast("Signup successful", { type: "success" });
        setSignupData(initialSignupData);
        navigate("/");
      }
    } catch (error: any) {
      toast(error.message, { type: "error" });
      console.log(error);
    }
  };

  useEffect(() => {
    if (user.userId) navigate("/");
  }, [user]);
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <div className="mb-6 text-5xl text-white font-light ">
        Create an account
      </div>
      <div className="w-5/6 flex flex-col items-center gap-4 md:w-[500px] bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-60 border-8 border-gray-200 py-5 px-5">
        {/* userId */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-400 font-bold text-xs" htmlFor="userId">
            Choose a userId:
          </label>
          <input
            onChange={handleChange}
            className="px-2 md:min-w-[300px] py-1 text-white bg-white bg-opacity-10 border rounded-sm max-w-sm"
            name="userId"
            type="text"
            value={signupData.userId}
          />
        </div>
        {/* name */}
        <div className="flex flex-col justify-center gap-1">
          <label className="text-gray-400 font-bold text-xs" htmlFor="name">
            Name:
          </label>
          <input
            onChange={handleChange}
            className="px-2 md:min-w-[300px] py-1 text-white bg-white bg-opacity-10 border rounded-sm max-w-sm"
            name="name"
            type="text"
            value={signupData.name}
          />
        </div>
        {/* email */}
        <div className="flex flex-col justify-center gap-1">
          <label className="text-gray-400 font-bold text-xs" htmlFor="email">
            Email:
          </label>
          <input
            onChange={handleChange}
            className="px-2 md:min-w-[300px] py-1 text-white bg-white bg-opacity-10 border rounded-sm max-w-sm"
            name="email"
            type="text"
            value={signupData.email}
          />
        </div>
        {/* phone */}
        <div className="flex flex-col justify-center gap-1">
          <label className="text-gray-400 font-bold text-xs" htmlFor="phone">
            Phone:
          </label>
          <input
            onChange={handleChange}
            className="px-2 md:min-w-[300px] py-1 text-white bg-white bg-opacity-10 border rounded-sm max-w-sm"
            name="phone"
            type="text"
            value={signupData.phone}
          />
        </div>
        <div className="flex flex-col justify-center gap-1">
          <label className="text-gray-400 font-bold text-xs" htmlFor="password">
            Set a password:
          </label>
          <input
            onChange={handleChange}
            className="px-2 md:min-w-[300px] py-1 text-white bg-white bg-opacity-10 border rounded-sm max-w-sm"
            name="password"
            type={showPass ? "text" : "password"}
            value={signupData.password}
          />
          <div className="flex text-xs gap-2 text-gray-400">
            <input
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setShowPass(e.target.checked)
              }
              type="checkbox"
              name="show_pass"
              id="show_pass"
            />
            Show Password
          </div>
        </div>
        <div className="w-full flex justify-center items-center">
          <button
            onClick={handleSubmit}
            className="bg-white text-sm font-bold px-3 py-1 hover:bg-transparent hover:text-white border"
          >
            Sign Up
          </button>
        </div>
      </div>
      <div className="text-white text-sm mt-2">
        Already have an account?{" "}
        <button
          onClick={() => navigate("/login")}
          className="bg-white text-sm text-black font-bold px-3 py-1 hover:bg-transparent hover:text-white border"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default SignUp;
