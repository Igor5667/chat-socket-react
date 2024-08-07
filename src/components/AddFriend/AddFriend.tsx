import "bootstrap/dist/css/bootstrap.min.css";
import { IoPersonAdd } from "react-icons/io5";
import { useState } from "react";
import axios from "axios";
import { socket } from "../../service/socket";

function AddFriend({ myNickname }: { myNickname: string }) {
  const [isFormShown, setIsFormShown] = useState<boolean>(false);
  const [name, setName] = useState<string>("");

  const makeFriend = async () => {
    try {
      socket.emit("invite:user", { sender: myNickname, receiver: name });
      setIsFormShown(false);
      setName("");
    } catch (error) {
      console.log("Cannot find friend");
      console.log(error);
    }
  };

  return (
    <>
      <button
        className={`btn btn-outline-light btn-lg  mx-auto mb-4 ${isFormShown && "btn active"}`}
        onClick={() => setIsFormShown(!isFormShown)}
      >
        Add Friend{" "}
        <span className="ms-2">
          <IoPersonAdd />
        </span>
      </button>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          makeFriend();
        }}
      >
        {isFormShown && (
          <div className="input-group mb-5">
            <input
              type="text"
              className="form-control"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <button className="btn btn-outline-secondary" type="button" onClick={makeFriend}>
              Add
            </button>
          </div>
        )}
      </form>
    </>
  );
}

export default AddFriend;
