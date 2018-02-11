import * as React from 'react'
import { Container } from 'reactstrap'
import PropTypes from 'prop-types'
import * as graphql from 'graphql'
import Link from 'gatsby-link'
import Helmet from 'react-helmet'

// code syntax-highlighting theme
// feel free to change it to another one
import 'prismjs/themes/prism-twilight.css'

// main site style
import './index.scss'

import {IFooterFields, Footer} from '../components/footer/Footer'

const TemplateWrapper = ({ children, data }: IPageContext<ILayoutData>) => {
  let user
  if (typeof window !== 'undefined') {
    user = window.netlifyIdentity && window.netlifyIdentity.currentUser()
  }
  return (
    <div className='App'>
      <Helmet title={data.site.siteMetadata.title} />
      <div className='navbar navbar-expand-lg navbar-light bg-light'>
        <Container fluid>
          <Link to='/' className='navbar-brand'>Home</Link>
          <ul className='nav navbar-nav'>

            {user && (
              <li className='nav-item'>
                <a href='/admin' className='nav-link'>Admin</a>
              </li>
            )}

            <li className='nav-item'>
              <Link to='/about' className='nav-link'>About</Link>
            </li>
          </ul>
        </Container>
      </div>
      <div className='pageContent'>{children()}</div>
      <Footer {...data.footer} />
    </div>
  )
}

interface ILayoutData {
  site: {
    siteMetadata: {
      title: string
    }
  }
  footer: IFooterFields
}

export const pageQuery = graphql`
  query LayoutIndexQuery {
    site {
      siteMetadata {
        title
      }
    }
    footer: markdownRemark(fileAbsolutePath: {regex: "/\/components/footer/Footer\\.md$/"}) {
      ...footerFields
    }
  }
`

export default TemplateWrapper
