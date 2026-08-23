import { useMemo, useState } from 'react'

const API_URL = 'https://api.postalpincode.in/pincode/'

export default function App() {
  const [pincode, setPincode] = useState('')
  const [postOffices, setPostOffices] = useState([])
  const [filterText, setFilterText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchedPincode, setSearchedPincode] = useState('')

  const filteredPostOffices = useMemo(() => {
    const search = filterText.trim().toLowerCase()
    return search ? postOffices.filter(office => office.Name.toLowerCase().includes(search)) : postOffices
  }, [filterText, postOffices])

  async function lookup(event) {
    event.preventDefault()
    if (!/^\d{6}$/.test(pincode)) {
      setError('Please enter a valid 6-digit Indian postal code.')
      setPostOffices([])
      setSearchedPincode('')
      return
    }

    setLoading(true)
    setError('')
    setFilterText('')
    setPostOffices([])
    setSearchedPincode(pincode)
    try {
      const response = await fetch(`${API_URL}${pincode}`)
      if (!response.ok) throw new Error('We could not reach the postal service. Please try again.')
      const [result] = await response.json()
      if (result.Status !== 'Success' || !Array.isArray(result.PostOffice)) {
        throw new Error(result.Message || 'No postal data was found for this pincode.')
      }
      setPostOffices(result.PostOffice)
    } catch (requestError) {
      setError(requestError.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <span className="flag" aria-hidden="true">⌖</span>
          <p className="eyebrow">INDIA POSTAL DIRECTORY</p>
          <h1>Find a pincode.<br /><em>Find a place.</em></h1>
          <p className="hero-copy">Enter any Indian postal code to discover the post offices and delivery areas it serves.</p>
          <form className="lookup-form" onSubmit={lookup} noValidate>
            <label htmlFor="pincode">Indian postal code</label>
            <div className="input-group">
              <input id="pincode" inputMode="numeric" maxLength="6" value={pincode} onChange={event => setPincode(event.target.value.replace(/\D/g, ''))} placeholder="e.g. 110001" aria-describedby={error ? 'form-error' : undefined} />
              <button type="submit" disabled={loading}>{loading ? 'Looking up…' : 'Lookup'} <span>→</span></button>
            </div>
          </form>
          {error && <p id="form-error" className="error" role="alert">{error}</p>}
        </div>
        <div className="postal-art" aria-hidden="true"><div className="sun" /><div className="route route-one" /><div className="route route-two" /><span>POST</span></div>
      </section>

      <section className="results" aria-live="polite">
        {loading && <div className="loader-wrap"><div className="loader" /><p>Searching postal records…</p></div>}

        {!loading && postOffices.length > 0 && <>
          <header className="results-header">
            <div><p className="eyebrow">SEARCH RESULTS</p><h2>Postal data for <span>{searchedPincode}</span></h2><p>{postOffices.length} post {postOffices.length === 1 ? 'office' : 'offices'} found in this area.</p></div>
            <label className="filter"><span>⌕</span><input value={filterText} onChange={event => setFilterText(event.target.value)} placeholder="Filter by post office name" /></label>
          </header>
          {filteredPostOffices.length > 0 ? <div className="cards">
            {filteredPostOffices.map((office, index) => <article className="card" key={`${office.Name}-${index}`}>
              <div className="card-number">{String(index + 1).padStart(2, '0')}</div>
              <h3>{office.Name}</h3>
              <dl><div><dt>Pincode</dt><dd>{office.Pincode}</dd></div><div><dt>District</dt><dd>{office.District}</dd></div><div><dt>State</dt><dd>{office.State}</dd></div></dl>
            </article>)}
          </div> : <div className="empty-filter"><span>⌕</span><h3>Couldn’t find the postal data you’re looking for…</h3><p>Try a different post office name.</p></div>}
        </>}

        {!loading && !error && postOffices.length === 0 && !searchedPincode && <div className="empty-start"><span>⌖</span><h2>Your search results will appear here.</h2><p>Start by entering a six-digit Indian postal code above.</p></div>}
      </section>
    </main>
  )
}
