import { createContext, useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";


export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const navigate = useNavigate();
  const [authToken, setAuthToken] = useState(() => sessionStorage.getItem("token"));
  const [current_user, setCurrentUser] = useState(null);

  console.log("Current user:", current_user);

  // LOGIN


  const login = (email, password) => {
    toast.loading("Logging you in...");
    fetch("https://bus-cdc-1.onrender.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((resp) => resp.json())
      .then((response) => {
        if (response.access_token) {
          toast.dismiss();
          sessionStorage.setItem("token", response.access_token);
          setAuthToken(response.access_token);
  
          // Fetch the current user data
          fetch("https://bus-cdc-1.onrender.com/current_user", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${response.access_token}`,
            },
          })
            .then((resp) => resp.json())
            .then((userData) => {
              if (userData.role === "admin") {
                navigate("/adminDashboard");
              } else {
                navigate("/user/dashboard");
              }
            });
  
          toast.success("Successfully logged in");
        } else {
          toast.dismiss();
          toast.error(response.error || "Failed to login");
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error("Something went wrong");
        console.error("Login error:", error);
      });
  };
  
  // LOGOUT
  
 const logout = () => {
  localStorage.removeItem("access_token");
  setCurrentUser(null); 
  navigate("/login");
};


  // FETCH CURRENT USER
  useEffect(() => {
    if (authToken) {
      fetchCurrentUser();
    }
  }, [authToken]);

  const fetchCurrentUser = () => {
    fetch("https://bus-cdc-1.onrender.com/current_user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((resp) => resp.json())
      .then((userData) => {
        if (userData.email) {
          setCurrentUser(userData);
          console.log("Current user data:", userData);
        }
      })
      .catch((error) => {
        console.error("Fetch current user error:", error);
      });
  };

  // REGISTER USER
  const addUser = (user) => {
    toast.loading("Registering...");
    fetch("https://bus-cdc-1.onrender.com/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        phoneNumber: user.phoneNumber,
        address: user.address,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        profilePicture: user.profilePicture || "", 
      }),
    })
      .then((resp) => resp.json())
      .then((response) => {
        toast.dismiss();
        if (response.message) {
          toast.success(response.message);
          setCurrentUser(response.user); 
          navigate("/login");
        } else {
          toast.error(response.error || "Failed to register");
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error("Registration failed");
        console.error("Registration error:", error);
      });
  };
  

  // const updateUser = () => {
  //   console.log("Updating user:");
  // };

  // const deleteUser = async (userId) => {
  //   console.log("Deleting user:", userId);
  // };
  

  const data = {
    authToken,
    login,
    current_user,
    setCurrentUser, 
    logout,
    addUser,
  
  };


  return <UserContext.Provider value={data}>{children}</UserContext.Provider>;
};
