import { Children, useState } from 'react';
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
 
const initialNodes = [
  {
    id: 'Narayan Pitale',
    type: 'input',
    data: { label: 'Narayan Pitale' },
    //position: { x: 250, y: 0 },
    Children: ['Anil Pitale', 'Hemant Pitale', 'Sunil Pitale', 'Sanjay Pitale', 'Sunita Pitale'],
  },
 
  {
    id: 'Anil Pitale',
    data: { label: 'Anil Pitale' },
    //position: { x: 150, y: 100 },
    type: 'output',
    
  },
  {
    id: 'Hemant Pitale',
    data: { label: 'Hemant Pitale' },
    //position: { x: 150, y: 100 },
    type: 'output',
    
  },
  {
    id: 'Sunil Pitale',
    data: { label: 'Sunil Pitale' },
    //position: { x: 150, y: 100 },
    type: 'output',
    
  },
  {
    id: 'Sanjay Pitale',
    data: { label: 'Sanjay Pitale' },
    //position: { x: 150, y: 100 },
    Children: ['Prathamesh Pitale'],
  },
  {
    id: 'Sunita Pitale',
    data: { label: 'Sunita Pitale' },
    //position: { x: 150, y: 100 },
    type: 'output',
    
  },
  {
    id: 'Prathamesh Pitale',
    data: { label: 'Prathamesh Pitale' },
    //position: { x: 150, y: 100 },
    type: 'output',
   
  },
];


// Step 2: Create a map for easy lookup
const nodeMap = Object.fromEntries(initialNodes.map(node => [node.id, { ...node }]));
console.log("nodemap", nodeMap)
const firstNode = Object.values(nodeMap)[0]; // The first node object
console.log(firstNode.id);    

// Step 3: Traverse tree level by level (BFS) and assign positions
const positionedNodes = [];
const visited = new Set();
console.log("visited",visited)

let queue = [{ id: firstNode.id, level: 0, xIndex: 0 }];
console.log(queue)
const levelSpacingY = 100;
const nodeSpacingX = 180;

while (queue.length > 0) {
  const nextQueue = [];

  queue.forEach(({ id, level, xIndex }) => {
    if (visited.has(id)) return;
    visited.add(id);

    const node = nodeMap[id];
    console.log(node)
    const positionedNode = {
      ...node,
      position: {
        x: xIndex * nodeSpacingX,
        y: level * levelSpacingY,
      },
    };

    positionedNodes.push(positionedNode);

    const children = node.Children || [];
    console.log("children, children.length",children, children.length)
    children.forEach((childId, i) => {
      console.log("child id, i",childId, i)
      nextQueue.push({ id: childId, level: level + 1, xIndex: xIndex * children.length + i });
    });
  });

  queue = nextQueue;
}

 
// const initialEdges = [
//   { id: 'e1-2', source: 'A', target: 'B' },
//   { id: 'e1-3', source: '1', target: '3' },
//   { id: 'e2-4', source: '2', target: '4' },
//   { id: 'e2-5', source: '2', target: '5' },
// ];

// Step 3: Center the tree horizontally
const minX = Math.min(...positionedNodes.map(node => node.position.x));
const maxX = Math.max(...positionedNodes.map(node => node.position.x));
const treeWidth = maxX - minX;
const treeCenterX = minX + treeWidth / 2;
const desiredCenterX = 0;
const offsetX = desiredCenterX - treeCenterX;

positionedNodes.forEach(node => {
  node.position.x += offsetX;
});


const initialEdges = positionedNodes.flatMap((node) => {
  console.log(node)
  if (!node.Children) return [];
  console.log(node.Children)
  return node.Children.map((childId) => ({
    id: `e${node.id}-${childId}`,
    source: node.id,
    target: childId,
  }));
});
 
function BFS() {
  //const [nodes, setNodes] = useState(initialNodes);
  //const [edges, setEdges] = useState(initialEdges);
 
  return ( 
  <div className='h-screen'>
    <ReactFlow nodes={positionedNodes} edges={initialEdges} fitView />
  </div>
  )
}
 
export default BFS;



// const initialNodes = [
//   {
//     id: 'A',
//     type: 'input',
//     data: { label: 'A' },
//     //position: { x: 250, y: 0 },
//     Children: ['B', 'C'],
//   },
 
//   {
//     id: 'B',
//     data: { label: 'B' },
//     //position: { x: 150, y: 100 },
//     Children: ['D', 'E'],
//   },
//   {
//     id: 'C',
//     type: 'output',
//     data: { label: 'C' },
//     //position: { x: 350, y: 100 },
//   },
//   {
//     id: 'D',
//     type: 'output',
//     data: { label: 'D' },
//     //position: { x: 0, y: 150 },
//   },
//   {
//     id: 'E',
//     type: 'output',
//     data: { label: 'E' },
//     //position: { x: 170, y: 150 },
//   },
// ];