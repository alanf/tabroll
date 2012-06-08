import webapp2
import os
from google.appengine.ext.webapp import template

class MainHandler(webapp2.RequestHandler):
    def get(self):
		template_values = {
			'strings': ['e', 'b', 'g', 'D', 'A', 'E'],
			'beats': range(32),
		}
		path = os.path.join(os.path.dirname(__file__), 'index.html')
		self.response.out.write(template.render(path, template_values))

app = webapp2.WSGIApplication([('/', MainHandler)],
                              debug=True)
