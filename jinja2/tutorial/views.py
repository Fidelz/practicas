from pyramid.view import (
    view_config,
    view_defaults
    )
from pyramid.response import Response
import json
import os.path


class TutorialViews:
    def __init__(self, request):
        self.request = request

    @view_config(route_name='home', renderer='home.jinja2')
    def home(self):
        global fname
        fname = "zones.json"
        fexists = os.path.isfile(fname)
        if fexists:
            with open(fname) as f:
                data_array = f.read()
            return {"zones": data_array}

        return {"zones": ""}

    @view_config(route_name='save_zone')
    def save_zone(self):
        data = json.dumps(self.request.json_body) + "]"
        fexists = os.path.isfile(fname)
        if fexists:
            # Not allow equals zone name
            if self._zone_name_not_exists(self.request.json_body["name"]):
                file = open(fname, "r+")
                file.seek(os.path.getsize(fname) - 1, 0)  # Index last ']'
                data = ", " + data
            else:
                return Response('{"fail": "Error, la zona ya existe."}')

        else:
            file = open(fname, "w")
            data = "[" + data

        file.write(data)
        file.close()
        return Response('{"result": "Zona guardada."}')

    def _zone_name_not_exists(self, zone_name):
        with open(fname) as f:
            data_array = json.load(f)
        for data in data_array:
            if data["name"] == zone_name:
                return False

        return True
