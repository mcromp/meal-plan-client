import React, { useEffect, useState } from 'react';
import { RootState } from '../../redux';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentUser } from '../../redux/users/userCurrent';
import { Redirect } from 'react-router-dom';
import { fetchDispatch, reqAddUser, reqDeleteUser, reqGetUsers } from '../../redux/fetchDispatch/fetchDispatch';
import { User } from '../../redux/users/users';
import { setAlertMessage } from '../../redux/alertMessage/alertMessage';
// import { fetchMenuList } from '../../redux/menuList/menuList';

const Login = () => {
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false)
  const [showAddUser, setShowAddUser] = useState<boolean>(false)
  const [value, setValue] = useState<string>("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState<boolean>(false)

  const alertMessage = useSelector<RootState, string>(state => state.alertMessage)
  const users = useSelector<RootState, User[]>(state => state.users)
  // const deleteStateMessage = useSelector<RootState, string | null>(state => state.userDelete.message)
  // const signupStateMessage = useSelector<RootState, string | null>(state => state.userSignup.message)
  const currentUser = useSelector<RootState, User | null>(state => state.currentUser)


  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchDispatch(reqGetUsers))
    console.log(users)
  }, [dispatch])

  useEffect(() => {
    if (alertMessage) handleMessage(alertMessage)
    dispatch(setAlertMessage(""))
  }, [dispatch, alertMessage])

  // useEffect(() => {
  //   if (signupStateMessage) handleMessage(signupStateMessage)
  //   // dispatch(resetDeleteMessage())
  // }, [dispatch, signupStateMessage])

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(e.target.value)
    setSelectedUser(users[+e.target.value])
  }

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setConfirmDelete(false)
    if (selectedUser) deleteUser(selectedUser.id)
    setSelectedUser(null)
    setValue("")
  }

  const deleteUser = (id: string) => {
    dispatch(fetchDispatch(reqDeleteUser, { id }))
    window.location.reload();
  }

  const signupUser = (username: string) => {
    dispatch(fetchDispatch(reqAddUser, { username }))
    dispatch(fetchDispatch(reqGetUsers))
    setShowAddUser(false)
  }

  const handleMessage = (text: string) => {
    setMessage(text)
    setTimeout(() => {
      setMessage(null)
    }, 1500);
  }

  const handleSignin = () => {
    if (selectedUser) dispatch(setCurrentUser(selectedUser))
    setLoggedIn(true)
    setSelectedUser(null)
    setValue("")
  }

  const checkValue = value.length === 0;

  if (loggedIn || currentUser) { return <Redirect to='/week' /> }
  return (
    <>
      {showAddUser ?
        <CreateUser
          setShowAddUser={setShowAddUser}
          signupUser={signupUser} />
        :
        confirmDelete ?

          <ConfirmDelete
            handleSubmit={handleSubmit}
            setConfirmDelete={setConfirmDelete}
            selectedUser={selectedUser} />
          :
          <>

            <SelectForm
              value={value}
              handleSelect={handleSelect} />


            <button disabled={checkValue} onClick={() => handleSignin()}>Sign in!</button>
            <button disabled={checkValue} onClick={() => setConfirmDelete(true)}>Delete user</button>
            <br />
            <button onClick={() => setShowAddUser(true)}>Sign up!</button>
            {message ? <span>{message}</span> : null}
          </>
      }
    </>
  )
}

export interface CreateUserProps {
  setShowAddUser: (boolean: boolean) => void;
  signupUser: (username: string) => void;
}


const CreateUser: React.FC<CreateUserProps> = ({
  setShowAddUser,
  signupUser
}) => {
  const [value, setValue] = useState("")
  const [usernameList, setUsernameList] = useState<string[]>([])
  const users = useSelector<RootState, User[]>(state => state.users)

  useEffect(() => {
    const newlist = users.reduce((acc: string[], user: User) => {
      acc.push(user.username)
      return acc
    }, [])
    setUsernameList(newlist)
  }, [users])

  const usernameIncluded = usernameList.includes(value);
  const submitDisabled = value.length <= 3 || usernameIncluded || value.length >= 15;
  return (
    <div>
      <span>Input Username for new user</span>
      <br />
      <input type="text" value={value} onChange={(e) => setValue(e.target.value)} />
      <button disabled={submitDisabled} onClick={() => signupUser(value)}>Submit</button>
      <button onClick={() => setShowAddUser(false)}>X</button>
      <br />
      { usernameIncluded ?
        <span>name already included</span> : null
      }
      {value.length <= 2 || value.length >= 25 ?
        <span>Username must be between 3 and 25 characters</span> : null
      }
    </div>
  )
}


export interface SelectFormProps {
  value: string;
  handleSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SelectForm: React.FC<SelectFormProps> = ({ value, handleSelect }) => {
  const users = useSelector<RootState, User[]>(state => state.users)
  const optionMap = (users.map((user: User, i: number) =>
    <option key={user.id} value={i}>{user.username}</option>
  ))
  return (
    <form>
      <label> Select your username:
          <select value={value} onChange={(e) => handleSelect(e)}>
          <option value="" disabled>Please select</option>
          {optionMap}
        </select>
      </label>
    </form>
  )
}

export interface ConfirmDeleteProps {
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  selectedUser: User | null;
  setConfirmDelete: (boolean: boolean) => void;
}
const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({
  handleSubmit,
  selectedUser,
  setConfirmDelete
}) => {

  return (
    <div style={{ backgroundColor: "plum" }}>
      <span>Delete {selectedUser ? selectedUser.username : null}?</span>
      <button onClick={(e) => handleSubmit(e)}>YES</button>
      <button onClick={() => setConfirmDelete(false)}>NO</button>
    </div>
  )
}

export default Login