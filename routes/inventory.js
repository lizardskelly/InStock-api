const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();


router.get('/', (_req, res) => {
  const inventoryList = JSON.parse(fs.readFileSync('./data/inventories.json'));
  res.json(inventoryList.map(inventory => {
    return {
      id: inventory.id,
      warehouseID: inventory.warehouseID,
      warehouseName: inventory.warehouseName,
      itemName: inventory.itemName,
      description: inventory.description,
      category: inventory.category,
      status: inventory.status,
      quantity: inventory.quantity
    }
  }))
})


router.post('/', (req, res) => {
  const { itemName, description, category, status, quantity, warehouseID, warehouseName } = req.body;

  if (!itemName || !description || !category || !status || quantity === undefined || !warehouseID || !warehouseName) {
    return res.status(400)
      .send("Error! One or more of the required request fields are empty");
  }
  else if (Number(quantity) !== JSON.parse(quantity)) {
    return res.status(400)
      .send("Error! Quantity field sent invaild data type");
  }
  else if (status !== 'In Stock' && status !== 'Out of Stock') {
    return res.status(400)
      .send("Error! Status field sent invalid data");
  }
  else {
    const newItem = {
      id: uuidv4(),
      warehouseID,
      warehouseName,
      itemName,
      description,
      category,
      status,
      quantity
    };
    const oldInventoryList = JSON.parse(fs.readFileSync('data/inventories.json'));
    let newInventoryList = [...oldInventoryList, newItem]; 
    fs.writeFileSync('data/inventories.json', JSON.stringify(newInventoryList));
    res.status(201).send(newItem.id);
  };
});

router.delete("/:id", (req, res) => {
  // grabs inventory array from json
  const inventoryData = JSON.parse(fs.readFileSync("data/inventories.json"));
  // finds the requested item
  const selectedItem = inventoryData.find(item => item.id === req.params.id);
  // throws back an error if requested item is not found
  if (!selectedItem) {
    return res.status(404).send(`Item with ID ${req.params.id} not found`);
  } else {
    // writes a new inventory array minus the requested item
    const newInventoryData = inventoryData.filter(item => item.id !== req.params.id);
    fs.writeFileSync("./data/inventories.json", JSON.stringify(newInventoryData));

    res.status(200).send(`Deleted item ${req.params.id}`);
  };
});

module.exports = router;