from flask_appbuilder.fieldwidgets import BS3TextFieldWidget, Select2ManyWidget
from flask_appbuilder.forms import DynamicForm
from flask_babel import lazy_gettext as _
from wtforms import BooleanField, StringField
from wtforms.ext.sqlalchemy.fields import QuerySelectField, QuerySelectMultipleField
from wtforms.validators import DataRequired, NoneOf

from superset import db, security_manager
from superset.models import core as models


class EmptySelectItem:
    id = -1

    # group select
    name = ""

    # owners select
    first_name = ""
    last_name = ""


class AutomaticDashboardForm(DynamicForm):

    title = StringField(
        _("Title"),
        validators=[DataRequired()],
        widget=BS3TextFieldWidget(),
    )
    group = QuerySelectField(
        _("Group"),
        description=_(
            "Set of databases that will be used as a source "
            "to create individually slices on the dashboard"),
        validators=[
            NoneOf(
                (EmptySelectItem,),
                message="Please choose one group"
            )
        ],
        query_factory=lambda: [EmptySelectItem] + db.session.query(models.DatabaseGroup).all(),
        get_pk=lambda g: g.id,
        get_label=lambda g: g.name,
    )
    slug = StringField(
        _("Slug"),
        description=_("To get a readable URL for your dashboard"),
        widget=BS3TextFieldWidget(),
    )
    # TODO allow updates on css and JSON Metadata
    owners = QuerySelectMultipleField(
        _("Owners"),
        description=_("Owners is a list of users who can alter the dashboard."),
        query_factory=lambda: db.session.query(security_manager.user_model).all(),
        get_pk=lambda u: u.id,
        get_label=lambda u: "%s %s" % (u.first_name, u.last_name),
        widget=Select2ManyWidget()
    )
    published = BooleanField(
        _("Published"),
        description=_("Determines whether or not this dashboard is visible in the list of all dashboards"),
    )
