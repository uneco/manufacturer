import styled from 'styled-components'

const RoundedList = styled.ul`
  margin: 0;
  padding: 0;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 400px;

  >li {
    list-style: none;
    padding: 1em;

    +li {
      border-top: 1px solid #ccc;
    }
  }
`

export default RoundedList
