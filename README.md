# @mostly-it/nact-extensions

A TypeScript library with reusable logic for the actor system library [@nact/core](https://www.npmjs.com/package/@nact/core).

## Solutions

### Source Code

The library is written in **TypeScript** and uses the _TypeScript compiler_ to check the code during development.

<table>
  <tr>
    <th>Configuration file</th>
    <th>Configuration description</th>
  </tr>
  <tr>
    <td>package.json</td>
    <td><ul>
      <li>The TypeScript compiler is run without outputs for type checking during testing script.</li>
      <li>TypeScript is added as a development dependency for code checking during development.</li>
      <li>TypeScript is added as a peer dependency because it is required by consumers of this package.</li>
    </ul></td>
  </tr>
  <tr>
    <td>tsconfig.json</td>
    <td><ul>
      <li>TypeScript is configured to check files and not emit JavaScript.</li>
    </ul></td>
  </tr>
</table>

### Package Distribution

**npm** is used as package distribution solution.

<table>
  <tr>
    <th>Configuration file</th>
    <th>Configuration description</th>
  </tr>
  <tr>
    <td>package.json</td>
    <td><ul>
      <li>Custom readme file is linked.</li>
      <li>Various pieces of package metadata, such as homepage and license, is filled out.</li>
    </ul></td>
  </tr>
</table>
