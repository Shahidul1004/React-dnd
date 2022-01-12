import React, { useRef, useState } from "react";
import "./App.css";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const MovableItem = ({ name, setItems, index, moveItemHandler }) => {
  const changeItemColumn = (item, columnName) => {
    setItems((prev) => {
      return prev.map((e) => {
        return {
          ...e,
          column: e.name === item.name ? columnName : e.column,
        };
      });
    });
  };

  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: "type",
    hover: (item, monitor) => {
      if (!ref.current) {
        console.log("null ref");
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      console.log(dragIndex, hoverIndex);
      // moveItemHandler(dragIndex, hoverIndex);
      // item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "type",
    item: { name: name, type: "type", index: index },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();

      if (dropResult) {
        console.log(dropResult.name, item);
        if (dropResult.name === "column-1") changeItemColumn(item, "column-1");
        else changeItemColumn(item, "column-2");
      }
    },

    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;

  drag(drop(ref));

  return (
    <div ref={ref} className="movable-item" style={{ opacity }}>
      {name}
    </div>
  );
};

// const FirstColumn = () => {
//   return (
//     <div className="column first-column">
//       Column 1
//       <MovableItem />
//     </div>
//   );
// };

const Column = ({ children, className, title }) => {
  const [, drop] = useDrop({
    accept: "type",
    drop: () => ({ name: title }),
    // collect: (monitor) => ({
    //   isOver: monitor.isOver(),
    //   canDrop: monitor.canDrop(),
    // }),
  });

  // console.log(canDrop, isOver);

  return (
    <div ref={drop} className={className}>
      {title}
      {children}
    </div>
  );
};

const App = () => {
  // const [isFirstColumn, setIsFirstColumn] = useState(true);
  const [items, setItems] = useState([
    { id: 1, name: "item-1", column: "column-1" },
    { id: 2, name: "item-2", column: "column-1" },
    { id: 3, name: "item-3", column: "column-1" },
  ]);

  const returnItemsForColumn = (columnName) => {
    return items
      .filter((item) => item.column === columnName)
      .map((item) => item);
  };

  const moveItemHandler = (dragIndex, hoverIndex) => {
    const dragItem = items[dragIndex];
    if (dragItem) {
      setItems((prev) => {
        const copiedStateArray = [...prev];
        const prevItem = copiedStateArray.splice(hoverIndex, 1, dragItem);
        copiedStateArray.splice(dragIndex, 1, prevItem[0]);
        return copiedStateArray;
      });
    }
  };

  return (
    <div className="container">
      <DndProvider backend={HTML5Backend}>
        <Column title="column-1" className="column first-column">
          {returnItemsForColumn("column-1").map((item, index) => (
            <MovableItem
              key={item.id}
              name={item.name}
              setItems={setItems}
              index={index}
              moveItemHandler={moveItemHandler}
            />
          ))}
        </Column>

        <Column title="column-2" className="column second-column">
          {returnItemsForColumn("column-2").map((item, index) => (
            <MovableItem
              key={item.id}
              name={item.name}
              setItems={setItems}
              index={index}
              moveItemHandler={moveItemHandler}
            />
          ))}
        </Column>
      </DndProvider>
    </div>
  );
};

export default App;
