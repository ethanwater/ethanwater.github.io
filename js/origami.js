var lightTheme = true;
const data = {
  'nodes': [{
    'id': 0x1,
    'label': "love",
    'size': 0xf
  }, {
    'id': 0x2,
    'label': "severance",
    'size': 0xa
  }, {
    'id': 0x3,
    'label': "beds",
    'size': 0xa
  }, {
    'id': 0x4,
    'label': 'modular',
    'size': 0x8
  }, {
    'id': 0x5,
    'label': "renaissance",
    'size': 0x8
  }, {
    'id': 0x6,
    'label': "memory",
    'size': 0xd
  }, {
    'id': 0x2,
    'label': "severance",
    'size': 0xa
  }, {
    'id': 0x3,
    'label': "beds",
    'size': 0xa
  }, {
    'id': 0x4,
    'label': 'modular',
    'size': 0x8
  }, {
    'id': 0x5,
    'label': "renaissance",
    'size': 0x8
  }, {
    'id': 0x6,
    'label': "memory",
    'size': 0xd
  }, {
    'id': 0x9,
    'label': "severance",
    'size': 0xa
  }, {
    'id': 0x3,
    'label': "beds",
    'size': 0xa
  }, {
    'id': 0x4,
    'label': 'modular',
    'size': 0x8
  }, {
    'id': 0x5,
    'label': "renaissance",
    'size': 0x8
  }, {
    'id': 0x6,
    'label': "memory",
    'size': 0xd
  }, {
    'id': 0x2,
    'label': "severance",
    'size': 0xa
  }, {
    'id': 0x3,
    'label': "beds",
    'size': 0xa
  }, {
    'id': 0x4,
    'label': 'modular',
    'size': 0x8
  }, {
    'id': 0x5,
    'label': "renaissance",
    'size': 0x8
  }, {
    'id': 0x6,
    'label': "memory",
    'size': 0xd
  }, {
    'id': 0x2,
    'label': "severance",
    'size': 0xa
  }, {
    'id': 0x3,
    'label': "beds",
    'size': 0xa
  }, {
    'id': 0x4,
    'label': 'modular',
    'size': 0x8
  }, {
    'id': 0x5,
    'label': "renaissance",
    'size': 0x8
  }, {
    'id': 0x6,
    'label': "memory",
    'size': 0xd
  }],
  'links': generateRandomLinks()
};

function generateRandomLinks() {
  const links = [];
  const nodeIds = [0x1, 0x2, 0x3, 0x4, 0x5, 0x6];
  const connectedNodes = new Set();
  
  // First, ensure every node is connected to at least one other node
  const shuffledNodes = [...nodeIds].sort(() => Math.random() - 0.5);
  
  // Connect each node to at least one other node
  for (let i = 0; i < shuffledNodes.length; i++) {
    const currentNode = shuffledNodes[i];
    
    if (!connectedNodes.has(currentNode)) {
      // Find a node to connect to (prefer unconnected nodes, but allow connected ones)
      let targetNode;
      const unconnectedNodes = shuffledNodes.filter(id => 
        id !== currentNode && !connectedNodes.has(id)
      );
      
      if (unconnectedNodes.length > 0) {
        targetNode = unconnectedNodes[Math.floor(Math.random() * unconnectedNodes.length)];
      } else {
        // All other nodes are connected, pick any other node
        const otherNodes = shuffledNodes.filter(id => id !== currentNode);
        targetNode = otherNodes[Math.floor(Math.random() * otherNodes.length)];
      }
      
      // Check if this link already exists to avoid duplicates
      const linkExists = links.some(link => 
        (link.source === currentNode && link.target === targetNode) ||
        (link.source === targetNode && link.target === currentNode)
      );
      
      if (!linkExists) {
        links.push({
          'source': currentNode,
          'target': targetNode
        });
        connectedNodes.add(currentNode);
        connectedNodes.add(targetNode);
      }
    }
  }
  
  // Add additional random connections to make the graph more interesting
  const additionalLinks = Math.floor(Math.random() * 4) + 2; // 2-5 additional links
  
  for (let i = 0; i < additionalLinks; i++) {
    const sourceId = nodeIds[Math.floor(Math.random() * nodeIds.length)];
    const targetId = nodeIds[Math.floor(Math.random() * nodeIds.length)];
    
    // Don't create self-loops and avoid duplicates
    if (sourceId !== targetId) {
      const linkExists = links.some(link => 
        (link.source === sourceId && link.target === targetId) ||
        (link.source === targetId && link.target === sourceId)
      );
      
      if (!linkExists) {
        links.push({
          'source': sourceId,
          'target': targetId
        });
      }
    }
  }
  
  return links;
}

async function fetchMarkdownContent(filename) {
  try {
    const response = await fetch('/markdown/' + filename + ".md");
    if (!response.ok) {
      throw new Error("Failed to load markdown file: " + filename);
    }
    return await response.text();
  } catch (error) {
    console.error(error);
    return "# Error\n\nCouldn't load content for " + filename;
  }
}

async function loadNodeContent() {
  const nodeContentMap = {};
  for (const node of data.nodes) {
    const filename = node.label.toLowerCase().replace(/\s+/g, '-');
    console.log(filename);
    nodeContentMap[node.id] = await fetchMarkdownContent(filename);
  }
  return nodeContentMap;
}

function setupNodeClickHandler(nodeContent) {
  node.on('click', function (event, nodeData) {
    // Remove any existing tooltip
    d3.selectAll(".node-tooltip").remove();
    
    // Remove selection from all nodes
    d3.selectAll(".node").classed('selected', false);
    d3.select(this).classed('selected', true);
    
    // Get node position
    const nodeX = nodeData.x;
    const nodeY = nodeData.y;
    
    // Determine tooltip position based on node coordinates
    // If node is in right half of screen, show tooltip to the left
    // If node is in left half, show tooltip to the right
    const isRightSide = nodeX > width / 2;
    const tooltipX = isRightSide ? nodeX - 200 : nodeX + 50;
    const tooltipY = nodeY + 30;
    
    // Create tooltip container
    const tooltip = g.append('g')
      .attr('class', 'node-tooltip')
      .attr('transform', `translate(${tooltipX}, ${tooltipY})`);
    
    // Add background rectangle
    const tooltipBg = tooltip.append('rect')
      .attr('width', 180)
      .attr('height', 120)
      .attr('rx', 8)
      .attr('fill', lightTheme ? '#ffffff' : '#333333')
      .attr('stroke', lightTheme ? '#cccccc' : '#666666')
      .attr('stroke-width', 1)
      .style('filter', 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))');
    
    // Add title
    tooltip.append('text')
      .attr('x', 10)
      .attr('y', 20)
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', lightTheme ? '#000000' : '#ffffff')
      .text(nodeData.label);
    
    // Add content preview (first few lines of markdown)
    const content = nodeContent[nodeData.id] || 'No content available';
    const preview = content.replace(/^#\s*.*\n/, '').substring(0, 100) + '...';
    
    // Split text into multiple lines for better display
    const words = preview.split(' ');
    let line = '';
    let lineNumber = 0;
    const maxLines = 6;
    
    for (let i = 0; i < words.length && lineNumber < maxLines; i++) {
      const testLine = line + words[i] + ' ';
      if (testLine.length > 25 && line !== '') {
        tooltip.append('text')
          .attr('x', 10)
          .attr('y', 40 + (lineNumber * 12))
          .attr('font-size', '11px')
          .attr('fill', lightTheme ? '#333333' : '#cccccc')
          .text(line);
        line = words[i] + ' ';
        lineNumber++;
      } else {
        line = testLine;
      }
    }
    
    // Add the remaining text
    if (line && lineNumber < maxLines) {
      tooltip.append('text')
        .attr('x', 10)
        .attr('y', 40 + (lineNumber * 12))
        .attr('font-size', '11px')
        .attr('fill', lightTheme ? '#333333' : '#cccccc')
        .text(line);
    }
    
    // Add close button
    const closeButton = tooltip.append('g')
      .attr('class', 'close-button')
      .style('cursor', 'pointer');
    
    closeButton.append('circle')
      .attr('cx', 165)
      .attr('cy', 15)
      .attr('r', 8)
      .attr('fill', '#ff4444')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1);
    
    closeButton.append('text')
      .attr('x', 165)
      .attr('y', 19)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#ffffff')
      .text('×');
    
    // Close button click handler
    closeButton.on('click', function() {
      d3.selectAll(".node-tooltip").remove();
      d3.selectAll(".node").classed('selected', false);
    });
  });
}

async function initGraph() {
  const nodeContent = await loadNodeContent();
  setupNodeClickHandler(nodeContent);
}

window.addEventListener("load", initGraph);
const width = document.getElementById("graph-container").offsetWidth;
const height = document.getElementById("graph-container").offsetHeight;

function isMobile() {
  return window.innerWidth <= 0x300;
}

const svg = d3.select("#graph-container").append("svg").attr("width", width).attr("height", height);
const g = svg.append('g');
const zoom = d3.zoom().scaleExtent([0.5, 0x4]).on("zoom", event => {
  g.attr("transform", event.transform);
});

if (window.innerWidth <= 0x300) {
  svg.call(zoom.transform, d3.zoomIdentity.scale(0.8));
} else {
  svg.call(zoom);
}

const simulation = d3.forceSimulation(data.nodes)
  .force('link', d3.forceLink(data.links).id(d => d.id).distance(40))
  .force("charge", d3.forceManyBody().strength(-600))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("collision", d3.forceCollide().radius(d => d.size * 2.5));

const link = g.append('g').selectAll("line").data(data.links).enter().append('line')
  .attr('class', "link")
  .attr("stroke-width", 1);

const node = g.append('g').selectAll("circle").data(data.nodes).enter().append("circle")
  .attr('class', "node")
  .attr('r', d => d.size)
  .attr("fill", "#222222")
  .attr('stroke', "#ffffff")
  .attr("stroke-width", 2)
  .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));

const label = g.append('g').selectAll("text").data(data.nodes).enter().append("text")
  .attr("class", "label")
  .attr('dy', 25)
  .attr('text-anchor', "middle")
  .text(d => d.label);

simulation.on("tick", () => {
  link.attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
  
  node.attr('cx', d => d.x)
      .attr('cy', d => d.y);
  
  label.attr('x', d => d.x)
       .attr('y', d => d.y);
});

node.on("click", function (event, nodeData) {
  d3.selectAll(".node").classed("selected", false);
  d3.select(this).classed("selected", true);
  document.getElementById("content-title").textContent = nodeData.label;
  document.getElementById("content-body").innerHTML = marked.parse(nodeContent[nodeData.id]);
});

function dragstarted(event, nodeData) {
  if (window.innerWidth <= 768) {
    return;
  }
  if (!event.active) {
    simulation.alphaTarget(0.3).restart();
  }
  nodeData.fx = nodeData.x;
  nodeData.fy = nodeData.y;
}

function dragged(event, nodeData) {
  if (window.innerWidth <= 768) {
    return;
  }
  nodeData.fx = event.x;
  nodeData.fy = event.y;
}

function dragended(event, nodeData) {
  if (window.innerWidth <= 768) {
    return;
  }
  if (!event.active) {
    simulation.alphaTarget(0);
  }
  nodeData.fx = null;
  nodeData.fy = null;
}

document.getElementById("zoom-in").addEventListener('click', () => {
  svg.transition().call(zoom.scaleBy, 1.3);
});

document.getElementById("zoom-out").addEventListener('click', () => {
  svg.transition().call(zoom.scaleBy, 0.7);
});

document.getElementById("site-theme").addEventListener("click", () => {
  const contentPanel = document.getElementById("content-panel");
  const contentTitle = document.getElementById("content-title");
  const contentBody = document.getElementById('content-body');
  const bodyElement = document.body;
  const titleElement = document.getElementById("title");
  const graphContainer = document.getElementById('graph-container');
  const buttons = document.querySelectorAll('button');
  
  if (lightTheme === true) {
    lightTheme = false;
    contentTitle.style.color = "white";
    contentBody.style.color = "white";
    bodyElement.style.backgroundColor = 'black';
    contentPanel.style.backgroundColor = "black";
    graphContainer.style.backgroundColor = "black";
    titleElement.style.color = 'white';
    d3.selectAll(".label").style("fill", 'white');
    buttons.forEach(button => {
      button.style.backgroundColor = "black";
      button.style.color = "white";
      button.style.border = "black";
    });
  } else {
    lightTheme = true;
    contentTitle.style.color = "black";
    contentBody.style.color = 'black';
    bodyElement.style.backgroundColor = "white";
    contentPanel.style.backgroundColor = "white";
    graphContainer.style.backgroundColor = "white";
    titleElement.style.color = "black";
    d3.selectAll(".label").style("fill", "black");
    buttons.forEach(button => {
      button.style.backgroundColor = "white";
      button.style.color = 'black';
      button.style.border = "white";
    });
  }
});

// Optional: Add a function to regenerate random connections
function regenerateConnections() {
  data.links = generateRandomLinks();
  
  // Update the simulation with new links
  simulation.force('link', d3.forceLink(data.links).id(d => d.id).distance(40));
  
  // Update the DOM elements
  const newLinks = g.select('g').selectAll("line").data(data.links);
  newLinks.exit().remove();
  newLinks.enter().append('line').attr('class', "link").attr("stroke-width", 1);
  
  // Restart the simulation
  simulation.alpha(1).restart();
}