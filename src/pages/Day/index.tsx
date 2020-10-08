import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Redirect, useParams } from "react-router-dom"
import { RootState } from "../../redux"
import { fetchDispatch, reqUpdateCalendar } from "../../redux/helpers/fetchDispatch"
import { User, CalendarItem, CalendarMenuItem, MenuItemJSON } from "../../shared/types"
import CheckoutBoardItem from "../CheckoutBoard"
import MenuBoard from "./MenuBoard"
import FilterButtonList from "./FilterBar"
import SearchBar from "./SearchBar"


const Day: React.FC = () => {
  const dispatch = useDispatch()
  const [returnToWeek, setReturnToWeek] = useState<boolean>(false)
  const currentUser = useSelector<RootState, User | null>(state => state.currentUser)
  const calendar = useSelector<RootState, CalendarItem[]>(state => state.calendar)
  const menuList = useSelector<RootState, MenuItemJSON[]>(state => state.menuList)
  const [checkoutBoardItems, setCheckoutBoardItems] = useState<CalendarMenuItem[]>([])
  const params: { day: string } = useParams()

  useEffect(() => {
    const menuItemFind = calendar.find(((item) => item.date === params.day))
    if (menuItemFind) {
      setCheckoutBoardItems(menuItemFind.menuItems)
    }
  }, [params.day, calendar])

  const handleSubmit = () => {
    if (currentUser && checkoutBoardItems) {
      const body = {
        userId: currentUser?.id,
        date: params.day,
        menuItems: [...checkoutBoardItems]
      }
      dispatch(fetchDispatch(reqUpdateCalendar, body))
    }
    setReturnToWeek(true)
  }

  const handleClearAll = () => {
    setCheckoutBoardItems([])
  }

  const modifyQuantityOfCheckoutBoardItem = (item: CalendarMenuItem, amount: number) => {
    if (checkoutBoardItems) {
      const tempBoard: CalendarMenuItem[] = [...checkoutBoardItems]
      const index: number = tempBoard?.indexOf(item);
      const updatedQuantity = tempBoard[index].quantity + amount
      updatedQuantity > 0 ?
        tempBoard[index].quantity = updatedQuantity
        : tempBoard.splice(index, 1)
      setCheckoutBoardItems(tempBoard)
    }
  }

  const removeFromCheckoutBoard = (item: CalendarMenuItem) => {
    if (checkoutBoardItems) {
      const temp = [...checkoutBoardItems]
      const index: number = temp?.indexOf(item);
      temp.splice(index, 1)
      setCheckoutBoardItems(temp)
    }
  }

  const addCheckOutBoardItem = (item: MenuItemJSON) => {
    if (checkoutBoardItems?.find(i => i.foodId === item.ID)) return;
    const itemToAdd: CalendarMenuItem = {
      foodId: item.ID,
      quantity: 1,
    }
    if (checkoutBoardItems) {
      const newArr = [...checkoutBoardItems]
      newArr.push(itemToAdd)
      setCheckoutBoardItems(newArr)
    }

  }

  const checkoutBoardMap =
    checkoutBoardItems.map((checkoutItem: CalendarMenuItem) => (
      <CheckoutBoardItem
        key={checkoutItem.foodId + "checkout"}
        item={checkoutItem}
        removeFromCheckoutBoard={removeFromCheckoutBoard}
        modifyQuantityOfCheckoutBoardItem={modifyQuantityOfCheckoutBoardItem} />
    ));

  if (!currentUser) { return <Redirect to='/' /> }
  if (returnToWeek) { return <Redirect to='/w' /> }
  // if (menuLoading) { return <span>Loading...</span> }

  return (
    <div style={{ backgroundColor: "pink" }}>

      {checkoutBoardMap}

      <button onClick={handleSubmit}>SUBMIT</button>
      <button onClick={handleClearAll}>CLEAR ALL</button>
      <button onClick={() => setReturnToWeek(true)}>return to week, without submitting</button>

      <SearchBar
        menuList={menuList}
        checkoutBoardItems={checkoutBoardItems}
        addCheckOutBoardItem={addCheckOutBoardItem} />

      <FilterButtonList />

      <MenuBoard
        checkoutBoardItems={checkoutBoardItems}
        addCheckOutBoardItem={addCheckOutBoardItem} />

    </div>
  );
}

export default Day;