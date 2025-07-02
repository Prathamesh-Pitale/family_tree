import { useState, useCallback, useRef } from 'react';
import { ReactFlow , MiniMap} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import ThemeToggle from './Features/ThemeToggle.jsx'

const initialNodes = [
  {
    id: 'Narayan Pitale',
    type: 'input',
    data: { label: 'Narayan Pitale' },
    Children: ['Anil Pitale', 'Hemant Pitale', 'Sunil Pitale', 'Sanjay Pitale', 'Sunita Pitale'],
  },
  { id: 'Anil Pitale', data: { label: 'Anil Pitale' }, type: 'output' },
  { id: 'Hemant Pitale', data: { label: 'Hemant Pitale' }, type: 'output' },
  { id: 'Sunil Pitale', data: { label: 'Sunil Pitale' }, type: 'output' },
  { id: 'Sanjay Pitale', data: { label: 'Sanjay Pitale' }, Children: ['Prathamesh Pitale'] },
  { id: 'Sunita Pitale', data: { label: 'Sunita Pitale' }, type: 'output' },
  { id: 'Prathamesh Pitale', data: { label: 'Prathamesh Pitale' }, type: 'output' },
];

function generateLayout(rootId, expandedNodes) {
  const nodeMap = Object.fromEntries(initialNodes.map(n => [n.id, { ...n }]));
  const levelSpacingY = 100;
  const nodeSpacingX = 180;
  const positionedNodes = [];
  let nextX = 0;

  function layoutTree(nodeId, depth) {
    const node = nodeMap[nodeId];
    const children = node.Children || [];

    let x;
    let childXs = [];
    
    // if (children.length === 0 ) {
    //   x = nextX * nodeSpacingX;
    //   nextX++;
    // } else {
    //   const childXs = children.map((childId) => layoutTree(childId, depth + 1));
    //   x = (Math.min(...childXs) + Math.max(...childXs)) / 2;
    // }

    if (expandedNodes.has(nodeId) && children.length > 0) {
      childXs = children.map((childId) => layoutTree(childId, depth + 1));
      x = (Math.min(...childXs) + Math.max(...childXs)) / 2;
    } else {
      x = nextX * nodeSpacingX;
      nextX++;
    }

  

    positionedNodes.push({
      ...node,
      position: {
        x,
        y: depth * levelSpacingY,
      },
      style: {
        backgroundColor: 'white',
        color: 'black',
      },
      className: 'dark:!bg-gray-700 dark:!text-white',
    });

    return x;
  }

  layoutTree(rootId, 0);

  const minX = Math.min(...positionedNodes.map(n => n.position.x));
  const maxX = Math.max(...positionedNodes.map(n => n.position.x));
  const offsetX = 0 - (minX + maxX) / 2;
  positionedNodes.forEach(n => (n.position.x += offsetX));

  const initialEdges = positionedNodes.flatMap(node => {
    if (!node.Children || !expandedNodes.has(node.id) )return [];
    return node.Children.map(childId => ({
      id: `e${node.id}-${childId}`,
      source: node.id,
      target: childId,
    }));
  });

  const parentMap = {};
  Object.values(nodeMap).forEach(node => {
    (node.Children || []).forEach(childId => {
      parentMap[childId] = node.id;
    });
  });


  return { nodes: positionedNodes, edges: initialEdges };
}

function Flow() {
  const [rootId, setRootId] = useState('Narayan Pitale');
  const allExpandable = initialNodes
  .filter(n => n.Children && n.Children.length > 0)
  .map(n => n.id);

const [expandedNodes, setExpandedNodes] = useState(new Set(allExpandable));

  const { nodes, edges } = generateLayout(rootId, expandedNodes);
  const reactFlowWrapper = useRef(null);

  // const onNodeClick = useCallback((_, node) => {
  //   //setRootId(node.id);

  // }, []);
  const onNodeClick = useCallback((_, node) => {
    setExpandedNodes((prev) => {
      const updated = new Set(prev);
      if (updated.has(node.id)) {
        updated.delete(node.id);
      } else {
        updated.add(node.id);
      }
      return updated;
    });
  }, []);

  function inlineEdgeStyles(container) {
    const edges = container.querySelectorAll('.react-flow__edge path');
    edges.forEach(edge => {
      const computed = window.getComputedStyle(edge);
      edge.setAttribute('stroke', computed.stroke || 'black');
      edge.setAttribute('stroke-width', computed.strokeWidth || '1');
    });
  }

  const exportToPNG = () => {
    if (!reactFlowWrapper.current) return;
    inlineEdgeStyles(reactFlowWrapper.current);
    htmlToImage.toPng(reactFlowWrapper.current, {
      backgroundColor: 'white',
    }).then((dataUrl) => {
      const link = document.createElement('a');
      link.download = 'family-tree.png';
      link.href = dataUrl;
      link.click();
    });
  };
  
  const exportToPDF = () => {
    if (!reactFlowWrapper.current) return;
    inlineEdgeStyles(reactFlowWrapper.current);
    htmlToImage.toPng(reactFlowWrapper.current, {
      backgroundColor: 'white',
    }).then((dataUrl) => {
      const pdf = new jsPDF({ orientation: 'landscape' });
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('family-tree.pdf');
    });
  };
  

  return (
    
    // <div className="h-screen p-4 transition-colors duration-500 bg-white text-black dark:bg-gray-900 dark:text-white">

    
    <div className="h-screen p-4 bg-white dark:bg-gray-900 text-black dark:text-white">
      
      <div className="mb-4 flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <select
            value={rootId}
            onChange={(e) => setRootId(e.target.value)}
            className="p-2 border rounded"
          >
            {initialNodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.id}
              </option>
            ))}
          </select>
          <button onClick={exportToPNG} className="px-4 py-2 bg-blue-500 text-white rounded dark:bg-blue-700">
            Export PNG
          </button>
          <button onClick={exportToPDF} className="px-4 py-2 bg-green-600 text-white rounded dark:bg-blue-700">
            Export PDF
          </button>
        </div>

        <div>
          <ThemeToggle />
        </div>
      </div>

        
      

      <div className="h-full bg-white dark:bg-gray-800 rounded" ref={reactFlowWrapper}>
        <ReactFlow nodes={nodes} edges={edges} fitView onNodeClick={onNodeClick} >
        </ReactFlow>
      </div>
    </div>
    // </div>
  );
}

export default Flow;

