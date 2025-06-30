import { useState, useCallback, useRef } from 'react';
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';

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

function generateLayout(rootId) {
  const nodeMap = Object.fromEntries(initialNodes.map(n => [n.id, { ...n }]));
  const levelSpacingY = 100;
  const nodeSpacingX = 180;
  const positionedNodes = [];
  let nextX = 0;

  function layoutTree(nodeId, depth) {
    const node = nodeMap[nodeId];
    const children = node.Children || [];

    let x;
    if (children.length === 0) {
      x = nextX * nodeSpacingX;
      nextX++;
    } else {
      const childXs = children.map((childId) => layoutTree(childId, depth + 1));
      x = (Math.min(...childXs) + Math.max(...childXs)) / 2;
    }

    positionedNodes.push({
      ...node,
      position: {
        x,
        y: depth * levelSpacingY,
      },
    });

    return x;
  }

  layoutTree(rootId, 0);

  const minX = Math.min(...positionedNodes.map(n => n.position.x));
  const maxX = Math.max(...positionedNodes.map(n => n.position.x));
  const offsetX = 0 - (minX + maxX) / 2;
  positionedNodes.forEach(n => (n.position.x += offsetX));

  const initialEdges = positionedNodes.flatMap(node => {
    if (!node.Children) return [];
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
  const { nodes, edges } = generateLayout(rootId);
  const reactFlowWrapper = useRef(null);

  const onNodeClick = useCallback((_, node) => {
    setRootId(node.id);
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
    <div className="h-screen p-4">
      <div className="mb-4 flex gap-4 items-center">
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
        <button onClick={exportToPNG} className="px-4 py-2 bg-blue-500 text-white rounded">Export PNG</button>
        <button onClick={exportToPDF} className="px-4 py-2 bg-green-600 text-white rounded">Export PDF</button>
      </div>

      <div className="h-full bg-white" ref={reactFlowWrapper}>
        <ReactFlow nodes={nodes} edges={edges} fitView onNodeClick={onNodeClick} />
      </div>
    </div>
  );
}

export default Flow;
