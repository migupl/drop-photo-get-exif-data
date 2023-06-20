const shadowCss = `
:host {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;

  border-radius: 10px;
  border-style: dashed;

  position: absolute;
  left: 50%;
  -ms-transform: translate(-50%);
  transform: translate(-50%);
}

.item {
  min-height: 50px;
  margin: 10px;
}

div object {
  min-height: 50px;
  position: relative;
  z-index: -1;
}
`

export { shadowCss }