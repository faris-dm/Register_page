import React, { useState, type ChangeEvent } from "react";

interface FormType {
  username: string;
  email: string;
  password: string;
}

function MainSections() {
  const [Data, setData] = useState<FormType>({
    username: "",
    email: "",
    password: "",
  });
  const HandleSubmit = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setData({ ...Data, [e.target.name]: e.target.value });
    alert("data sent");
  };
  return (
    <div>
      <p> new form inputs</p>

      <form action="">
        <label htmlFor="">username</label>
        <input
          type="text"
          placeholder="enter name"
          name="username"
          id=""
          value={Data.username} onChange={HandleSubmit}
        />
           
        <br />
        <label htmlFor="">email</label>
        <input
          type="email"
          placeholder="enter email"
          name="email"
          value={Data.email}
          id="" onChange={HandleSubmit}
        />
        <br />
        <input
          type="passwors"
          placeholder="enter password"
          name="password"
          value={Data.password} onChange={HandleSubmit}
          id=""
        />
      </form>
    </div>
  );
}

export default MainSections;
