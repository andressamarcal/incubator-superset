import os

from flask import g, redirect, flash
from flask_appbuilder import expose
from flask_appbuilder.security.decorators import has_access
from flask_appbuilder import SimpleFormView
from flask_babel import gettext as __
from flask_babel import lazy_gettext as _
from sqlalchemy.exc import IntegrityError
from werkzeug.utils import secure_filename

from superset import app, appbuilder, security_manager, db
from superset.connectors.sqla.models import SqlaTable
from superset.utils import core as utils
from superset.models import core as models

from .forms import AutomaticDashboardForm
from ..base import BaseSupersetView


config = app.config
stats_logger = config.get("STATS_LOGGER")


class Dashboard(BaseSupersetView):
    """The base views for Superset!"""

    @has_access
    @expose("/new/")
    def new(self):  # pylint: disable=no-self-use
        """Creates a new, blank dashboard and redirects to it in edit mode"""
        new_dashboard = models.Dashboard(
            dashboard_title="[ untitled dashboard ]", owners=[g.user]
        )
        db.session.add(new_dashboard)
        db.session.commit()
        return redirect(f"/superset/dashboard/{new_dashboard.id}/?edit=true")


appbuilder.add_view_no_menu(Dashboard)


class AutomaticDashboardView(SimpleFormView):
    form = AutomaticDashboardForm
    form_template = "superset/form_view/automatic_dashboard_view/edit.html"
    form_title = _("Add Dashboard")

    def form_post(self, form):
        dashboard = models.Dashboard()

        dashboard.dashboard_title = form.title.data
        dashboard.group = [form.group.data]  # TODO check if this group is already being used by another dashboard
        dashboard.slug = form.slug.data
        dashboard.owners = form.owners.data
        dashboard.published = form.published.data
        return redirect("/dashboard/list/")


appbuilder.add_view_no_menu(AutomaticDashboardView)
