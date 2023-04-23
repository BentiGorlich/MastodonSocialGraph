import ReactDom from 'react-dom'
import React from 'react'
import Home from '../src/Home'
import ErrorBoundary from '../src/ErrorBoundary'

const root = document.getElementById("home-root")

ReactDom.render(<ErrorBoundary><Home /></ErrorBoundary>, root)
