import React, { useState, useLayoutEffect } from "react";
import * as d3 from "d3";
import "antd/dist/antd.css";
import { Button, Radio } from "antd";

import Cases from "./cases-sample.json";
import Links from "./links-sample.json";

function ForceDirectedGraph() {
  const [svgNode, setSvgNode] = React.useState(null);
  const [size, setSize] = useState("gender");

  let new_links = JSON.parse(
    JSON.stringify(Links).split('"infector":').join('"source":')
  );

  new_links = JSON.parse(
    JSON.stringify(new_links).split('"infectee":').join('"target":')
  );

  useLayoutEffect(() => {
    //initilize svg or grab svg
    var svg = d3.select("svg");
    var width = svg.attr("width");
    var height = svg.attr("height");

    //intialize data
    var graph = {
      nodes: Cases,
      links: new_links,
    };

    var simulation = d3
      .forceSimulation(graph.nodes)

      .force(
        "link",
        d3
          .forceLink()
          .distance(80)
          .id(function (d) {
            return d.id;
          })
          .links(graph.links)
      )

      .force("charge", d3.forceManyBody().strength(-40))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);

    //arrow
    // build the arrow.
    svg
      .append("svg:defs")
      .selectAll("marker")
      .data(["end"]) // Different link/path types can be defined here
      .enter()
      .append("svg:marker") // This section adds in the arrows
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 38)
      .attr("refY", -3.8)
      .attr("markerWidth", 3.7)
      .attr("markerHeight", 3.7)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#A9A9A9");

    var link = svg
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graph.links)
      .enter()
      .append("path")
      .attr("marker-end", "url(#end)")
      .attr("stroke", "#A9A9A9")
      .attr("fill", "white")
      .attr("stroke-width", "1.5");

    var node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(graph.nodes)
      .enter()
      .append("circle")
      .attr("r", 15)
      .style("fill", (d) => {
        if (d.gender === "male") {
          return "#0081a7";
        } else {
          return "#f07167";
        }
      })
      .attr("stroke", "white")
      .attr("stroke-width", "3")
      .on("mouseenter", (d) => {
        // Push data from node to right-side bar
        console.log(d);
        d3.select("#patient_id").text(d.id);
        d3.select("#patient_date").text(d.date);
        d3.select("#patient_age").text(d.age);
        d3.select("#patient_gender").text(d.gender);
        d3.select("#patient_nationality").text(d.nationality);
        d3.select("#patient_occupation").text(d.occupation);
        d3.select("#patient_organization").text(d.organization);
        d3.select("#patient_serology").text(d.serology);
        d3.select("#patient_vaccinated").text(d.vaccinated);

        node.filter((n) => n.id === d.id).attr("stroke", "red");
        link
          .filter((l) => l.source.id === d.id || l.target.id === d.id)
          .attr("stroke", "red");
      })
      .on("mouseleave", (d) => {
        node.attr("stroke", "white");
        link.attr("stroke", "#A9A9A9");

        // Clear data on the right-side bar
        d3.select("#patient_id").text("");
        d3.select("#patient_date").text("");
        d3.select("#patient_age").text("");
        d3.select("#patient_gender").text("");
        d3.select("#patient_nationality").text("");
        d3.select("#patient_occupation").text("");
        d3.select("#patient_organization").text("");
        d3.select("#patient_serology").text("");
        d3.select("#patient_vaccinated").text("");
      })
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    function ticked() {
      link.attr("d", function (d) {
        var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy);
        return (
          "M" +
          d.source.x +
          "," +
          d.source.y +
          "A" +
          dr +
          "," +
          dr +
          " 0 0,1 " +
          d.target.x +
          "," +
          d.target.y
        );
      });

      node
        .attr("cx", function (d) {
          return d.x;
        })
        .attr("cy", function (d) {
          return d.y;
        });
    }

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    var svg = d3.select("#my_dataviz");

    // Gender  legend
    svg
      .append("circle")
      .attr("cx", 200)
      .attr("cy", 130)
      .attr("r", 6)
      .style("fill", "#0081a7");
    svg
      .append("circle")
      .attr("cx", 200)
      .attr("cy", 160)
      .attr("r", 6)
      .style("fill", "#f07167");
    svg
      .append("text")
      .attr("x", 220)
      .attr("y", 130)
      .text("Male")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
    svg
      .append("text")
      .attr("x", 220)
      .attr("y", 160)
      .text("Female")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
  }, []);

  function byVaccinationFunc() {
    d3.select("#graphSVG")
      .selectAll("circle")
      .style("fill", (d) => {
        if (d.vaccinated === "yes (2 doses)") {
          return "#06d6a0";
        } else if (d.vaccinated === "partial (1 dose)") {
          return "#ffd166";
        } else {
          return "#ef476f";
        }
      });

    var svg = d3.select("#my_dataviz");

    // Vaccination Legend
    svg
      .append("circle")
      .attr("cx", 200)
      .attr("cy", 130)
      .attr("r", 6)
      .style("fill", "#06d6a0");
    svg
      .append("circle")
      .attr("cx", 200)
      .attr("cy", 160)
      .attr("r", 6)
      .style("fill", "#ffd166");
    svg
      .append("circle")
      .attr("cx", 200)
      .attr("cy", 190)
      .attr("r", 6)
      .style("fill", "#ef476f");
    svg
      .append("text")
      .attr("x", 220)
      .attr("y", 130)
      .text("Yes (2 Doses)")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
    svg
      .append("text")
      .attr("x", 220)
      .attr("y", 160)
      .text("Partial (1 Dose)")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
    svg
      .append("text")
      .attr("x", 220)
      .attr("y", 190)
      .text("Unvaccinated")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
  }

  function byGenderFunc() {
    d3.select("#graphSVG")
      .selectAll("circle")
      .style("fill", (d) => {
        if (d.gender === "male") {
          return "#0081a7";
        } else {
          return "#f07167";
        }
      });

    var svg = d3.select("#my_dataviz");

    // Gender Legend
    svg
      .append("circle")
      .attr("cx", 200)
      .attr("cy", 130)
      .attr("r", 6)
      .style("fill", "#0081a7");
    svg
      .append("circle")
      .attr("cx", 200)
      .attr("cy", 160)
      .attr("r", 6)
      .style("fill", "#f07167");
    svg
      .append("text")
      .attr("x", 220)
      .attr("y", 130)
      .text("Male")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
    svg
      .append("text")
      .attr("x", 220)
      .attr("y", 160)
      .text("Female")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
  }

  function byAgeFunc() {
    d3.select("#graphSVG")
      .selectAll("circle")
      .style("fill", (d) => {
        switch (true) {
          case d.age >= 60:
            return "#a4133c";
          case d.age >= 50:
            return "#c9184a";
          case d.age >= 40:
            return "#ff4d6d";
          case d.age >= 30:
            return "#ff758f";
          case d.age >= 18:
            return "#ff8fa3";
          default:
            return "#ffb3c1";
        }
      });
    var svg = d3.select("#my_dataviz");

    // Age legend
    svg
      .append("circle")
      .attr("cx", 200)
      .attr("cy", 130)
      .attr("r", 6)
      .style("fill", "#ffb3c1");
    svg
      .append("circle")
      .attr("cx", 200)
      .attr("cy", 160)
      .attr("r", 6)
      .style("fill", "#ff8fa3");
    svg
      .append("circle")
      .attr("cx", 200)
      .attr("cy", 190)
      .attr("r", 6)
      .style("fill", "#ff758f");
    svg
      .append("circle")
      .attr("cx", 200)
      .attr("cy", 220)
      .attr("r", 6)
      .style("fill", "#ff4d6d");
    svg
      .append("circle")
      .attr("cx", 200)
      .attr("cy", 250)
      .attr("r", 6)
      .style("fill", "#c9184a");
    svg
      .append("circle")
      .attr("cx", 200)
      .attr("cy", 280)
      .attr("r", 6)
      .style("fill", "#a4133c");
    svg
      .append("text")
      .attr("x", 220)
      .attr("y", 130)
      .text("0 - 17")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
    svg
      .append("text")
      .attr("x", 220)
      .attr("y", 160)
      .text("18 - 29")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
    svg
      .append("text")
      .attr("x", 220)
      .attr("y", 190)
      .text("30 - 39")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
    svg
      .append("text")
      .attr("x", 220)
      .attr("y", 220)
      .text("40 - 49")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
    svg
      .append("text")
      .attr("x", 220)
      .attr("y", 250)
      .text("50 - 59")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
    svg
      .append("text")
      .attr("x", 220)
      .attr("y", 280)
      .text("60 & older")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
  }

  return (
    <div>
      <div id="container">
        <div>
          <div
            style={{
              width: window.innerWidth * 0.75,
              position: "absolute",
              textAlign: "center",
            }}
          >
            <br />
            <h2>Covid-19 Contact Tracing Visualization Graph</h2>
            <Radio.Group
              value={size}
              onChange={(e) => {
                // Remove all child elements in legend
                d3.select("#my_dataviz").selectAll("*").remove();

                // Set value in radiogroup
                setSize(e.target.value);

                // Based on selected radio button, run the respective function
                if (e.target.value === "gender") {
                  byGenderFunc();
                } else if (e.target.value === "vaccination") {
                  byVaccinationFunc();
                } else {
                  byAgeFunc();
                }
              }}
            >
              <Radio.Button value="gender">Gender</Radio.Button>
              <Radio.Button value="vaccination">Vaccination</Radio.Button>
              <Radio.Button value="age">Age</Radio.Button>
            </Radio.Group>
          </div>
          <svg
            id="graphSVG"
            width={window.innerWidth * 0.75}
            height={window.innerHeight * 0.99}
            ref={setSvgNode}
          ></svg>
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: window.innerHeight * 0.999,
            backgroundColor: "#F2F2F2",
            width: window.innerWidth * 0.25,
            textAlign: "left",
            paddingLeft: 20,
          }}
        >
          <br />
          <h2>Patient Information</h2>
          <h5>Hover over node to view details</h5>

          <table>
            <tbody>
              <tr>
                <td width={window.innerWidth * 0.07}>Patient ID</td>
                <td>
                  <b>
                    <span id="patient_id"></span>
                  </b>
                </td>
              </tr>
              <tr>
                <td width={window.innerWidth * 0.07}>Infection Date</td>
                <td>
                  <b>
                    <span id="patient_date"></span>
                  </b>
                </td>
              </tr>
              <tr>
                <td width={window.innerWidth * 0.07}>Age</td>
                <td>
                  <b>
                    <span id="patient_age"></span>
                  </b>
                </td>
              </tr>
              <tr>
                <td width={window.innerWidth * 0.07}>Gender</td>
                <td>
                  <b>
                    <span id="patient_gender"></span>
                  </b>
                </td>
              </tr>
              <tr>
                <td width={window.innerWidth * 0.07}>Nationality</td>
                <td>
                  <b>
                    <span id="patient_nationality"></span>
                  </b>
                </td>
              </tr>
              <tr>
                <td width={window.innerWidth * 0.07}>Occupation</td>
                <td>
                  <b>
                    <span id="patient_occupation"></span>
                  </b>
                </td>
              </tr>
              <tr>
                <td width={window.innerWidth * 0.07}>Organization</td>
                <td>
                  <b>
                    <span id="patient_organization"></span>
                  </b>
                </td>
              </tr>
              <tr>
                <td width={window.innerWidth * 0.05}>Serology</td>
                <td>
                  <b>
                    <span id="patient_serology"></span>
                  </b>
                </td>
              </tr>
              <tr>
                <td width={window.innerWidth * 0.05}>Vaccinated</td>
                <td>
                  <b>
                    <span id="patient_vaccinated"></span>
                  </b>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <svg
        id="my_dataviz"
        height={300}
        width={450}
        style={{ position: "absolute", top: "0px" }}
      ></svg>
    </div>
  );
}

export default ForceDirectedGraph;
